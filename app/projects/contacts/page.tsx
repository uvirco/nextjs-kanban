"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Contact } from "@/types/types";
import { supabase } from "@/lib/supabase";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import { IconPlus } from "@tabler/icons-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { toast } from "sonner";
import AddContactModal from "./AddContactModal";

export default function ContactsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filtering state
  const [filterType, setFilterType] = useState<string>("");
  const [filterCompany, setFilterCompany] = useState<string>("");
  const [filterCity, setFilterCity] = useState<string>("");
  const [filterCountry, setFilterCountry] = useState<string>("");
  const [filterCreatedBy, setFilterCreatedBy] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Unique values for dropdowns
  const [allCompanies, setAllCompanies] = useState<string[]>([]);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [allCountries, setAllCountries] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from("Contact")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to fetch contacts");
      setLoading(false);
      return;
    }

    // Fetch user details for created_by fields
    const userIds = new Set<string>();
    (data || []).forEach((contact: any) => {
      if (contact.created_by) {
        userIds.add(contact.created_by);
      }
    });

    const userMap: Record<string, any> = {};
    if (userIds.size > 0) {
      const { data: userData } = await supabase
        .from("User")
        .select("id, name, email")
        .in("id", Array.from(userIds));

      if (userData) {
        userData.forEach((user: any) => {
          userMap[user.id] = user;
        });
      }
    }

    // Enrich contacts with user data and collect unique values
    const enrichedContacts = (data || []).map((contact: any) => ({
      ...contact,
      user: contact.created_by ? userMap[contact.created_by] : null,
    }));

    // Collect unique values for filters
    const companies = new Set<string>();
    const cities = new Set<string>();
    const countries = new Set<string>();
    const users = new Set<string>();

    enrichedContacts.forEach((contact: any) => {
      if (contact.company) companies.add(contact.company);
      if (contact.city) cities.add(contact.city);
      if (contact.country) countries.add(contact.country);
      if (contact.created_by) users.add(contact.created_by);
    });

    setAllCompanies(Array.from(companies).sort());
    setAllCities(Array.from(cities).sort());
    setAllCountries(Array.from(countries).sort());
    setAllUsers(
      Array.from(users).map((id) => ({
        id,
        name: userMap[id]?.name || id,
        email: userMap[id]?.email || id,
      }))
    );

    setContacts(enrichedContacts);
    setLoading(false);
  };

  const getFilteredAndSortedContacts = () => {
    let filtered = [...contacts];

    // Apply filters
    if (filterType) {
      filtered = filtered.filter((c) => c.contact_type === filterType);
    }
    if (filterCompany) {
      filtered = filtered.filter((c) => c.company === filterCompany);
    }
    if (filterCity) {
      filtered = filtered.filter((c) => c.city === filterCity);
    }
    if (filterCountry) {
      filtered = filtered.filter((c) => c.country === filterCountry);
    }
    if (filterCreatedBy) {
      filtered = filtered.filter((c) => c.created_by === filterCreatedBy);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term) ||
          c.phone?.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any = a[sortColumn as keyof Contact];
      let bVal: any = b[sortColumn as keyof Contact];

      if (aVal === null || aVal === undefined) aVal = "";
      if (bVal === null || bVal === undefined) bVal = "";

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const clearFilters = () => {
    setFilterType("");
    setFilterCompany("");
    setFilterCity("");
    setFilterCountry("");
    setFilterCreatedBy("");
    setSearchTerm("");
  };

  const handleDelete = async (contactId: string) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) {
      return;
    }

    const { error } = await supabase
      .from("Contact")
      .delete()
      .eq("id", contactId);

    if (error) {
      toast.error("Failed to delete contact");
      console.error(error);
    } else {
      toast.success("Contact deleted");
      fetchContacts();
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) return <span className="text-zinc-500">⇅</span>;
    return sortDirection === "asc" ? (
      <span className="text-blue-400">↑</span>
    ) : (
      <span className="text-blue-400">↓</span>
    );
  };

  const filteredContacts = getFilteredAndSortedContacts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-zinc-400">Loading contacts...</p>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-zinc-950">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <Button
          color="primary"
          onClick={() => {
            setEditingContact(null);
            setIsModalOpen(true);
          }}
          startContent={<IconPlus size={20} />}
        >
          Add Contact
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 p-6 rounded-lg mb-6 border border-zinc-800">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>

        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-zinc-800"
          />
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          <Select
            label="Type"
            selectedKeys={filterType ? [filterType] : []}
            onSelectionChange={(keys) =>
              setFilterType(Array.from(keys)[0] as string)
            }
            className="bg-zinc-800"
          >
            <SelectItem key="supplier">Supplier</SelectItem>
            <SelectItem key="contractor">Contractor</SelectItem>
            <SelectItem key="team_member">Team Member</SelectItem>
            <SelectItem key="client">Client</SelectItem>
            <SelectItem key="other">Other</SelectItem>
          </Select>

          <Select
            label="Company"
            selectedKeys={filterCompany ? [filterCompany] : []}
            onSelectionChange={(keys) =>
              setFilterCompany(Array.from(keys)[0] as string)
            }
            className="bg-zinc-800"
          >
            {allCompanies.map((company) => (
              <SelectItem key={company}>{company}</SelectItem>
            ))}
          </Select>

          <Select
            label="City"
            selectedKeys={filterCity ? [filterCity] : []}
            onSelectionChange={(keys) =>
              setFilterCity(Array.from(keys)[0] as string)
            }
            className="bg-zinc-800"
          >
            {allCities.map((city) => (
              <SelectItem key={city}>{city}</SelectItem>
            ))}
          </Select>

          <Select
            label="Country"
            selectedKeys={filterCountry ? [filterCountry] : []}
            onSelectionChange={(keys) =>
              setFilterCountry(Array.from(keys)[0] as string)
            }
            className="bg-zinc-800"
          >
            {allCountries.map((country) => (
              <SelectItem key={country}>{country}</SelectItem>
            ))}
          </Select>

          <Select
            label="Created By"
            selectedKeys={filterCreatedBy ? [filterCreatedBy] : []}
            onSelectionChange={(keys) =>
              setFilterCreatedBy(Array.from(keys)[0] as string)
            }
            className="bg-zinc-800"
          >
            {allUsers.map((user) => (
              <SelectItem key={user.id}>{user.name}</SelectItem>
            ))}
          </Select>

          <Button
            variant="flat"
            onClick={clearFilters}
            className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-zinc-400 mb-4">
        Showing {filteredContacts.length} of {contacts.length} contacts
      </div>

      {/* Table */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-800">
              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-700"
                onClick={() => handleSort("name")}
              >
                Name <SortIcon column="name" />
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-700"
                onClick={() => handleSort("email")}
              >
                Email <SortIcon column="email" />
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-700"
                onClick={() => handleSort("phone")}
              >
                Phone <SortIcon column="phone" />
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-700"
                onClick={() => handleSort("company")}
              >
                Company <SortIcon column="company" />
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-700"
                onClick={() => handleSort("contact_type")}
              >
                Type <SortIcon column="contact_type" />
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-700"
                onClick={() => handleSort("city")}
              >
                City <SortIcon column="city" />
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-700"
                onClick={() => handleSort("country")}
              >
                Country <SortIcon column="country" />
              </th>
              <th className="px-4 py-3 text-left">Created By</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-zinc-400">
                  No contacts found
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => (
                <tr key={contact.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                  <td className="px-4 py-3">{contact.name}</td>
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {contact.email || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {contact.phone || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">{contact.company || "-"}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded text-xs">
                      {contact.contact_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{contact.city || "-"}</td>
                  <td className="px-4 py-3 text-sm">{contact.country || "-"}</td>
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {contact.user?.name || contact.created_by || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="flat"
                        size="sm"
                        onClick={() => {
                          setEditingContact(contact);
                          setIsModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="flat"
                        size="sm"
                        color="danger"
                        onClick={() => handleDelete(contact.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddContactModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingContact(null);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setEditingContact(null);
          fetchContacts();
        }}
        editingContact={editingContact}
      />
    </div>
  );
}
