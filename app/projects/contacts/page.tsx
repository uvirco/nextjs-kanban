"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Contact } from "@/types/types";
import { supabase } from "@/lib/supabase";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Chip } from "@nextui-org/chip";
import {
  IconPlus,
  IconChevronUp,
  IconChevronDown,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
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

  const getTypeOptions = () => [
    { key: "supplier", label: "Supplier" },
    { key: "contractor", label: "Contractor" },
    { key: "team_member", label: "Team Member" },
    { key: "client", label: "Client" },
    { key: "other", label: "Other" },
  ];

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? 
      <IconChevronUp size={14} className="inline ml-1" /> : 
      <IconChevronDown size={14} className="inline ml-1" />;
  };

  const FilterSection = ({
    title,
    options,
    selectedKey,
    onSelectionChange,
    color,
  }: {
    title: string;
    options: Array<{ key: string; label: string }>;
    selectedKey: string;
    onSelectionChange: (key: string) => void;
    color: string;
  }) => {
    const [isOpen, setIsOpen] = useState(true);

    const counts = getFilterCounts();
    const countMap = {
      Type: counts.types,
      Company: counts.companies,
      City: counts.cities,
      Country: counts.countries,
      "Created By": counts.creators,
    };

    return (
      <div className="mb-6 border-b border-zinc-700 pb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full mb-3"
        >
          <h4 className={`font-semibold text-sm uppercase tracking-wide ${
            color === "purple" ? "text-purple-300" :
            color === "blue" ? "text-blue-300" :
            color === "green" ? "text-green-300" :
            color === "orange" ? "text-orange-300" :
            "text-cyan-300"
          }`}>
            {title}
          </h4>
          {isOpen ? (
            <IconChevronUp size={16} className="text-zinc-400" />
          ) : (
            <IconChevronDown size={16} className="text-zinc-400" />
          )}
        </button>

        {isOpen && (
          <div className="space-y-2">
            {options.map((option) => (
              <button
                key={option.key}
                onClick={() => onSelectionChange(selectedKey === option.key ? "" : option.key)}
                className={`w-full text-left px-3 py-2 rounded transition-colors text-sm ${
                  selectedKey === option.key
                    ? `bg-${color}-900/40 text-${color}-300 border border-${color}-700/50`
                    : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{option.label}</span>
                  {countMap[title as keyof typeof countMap]?.[option.key] && (
                    <span className={`text-xs font-bold ${
                      color === "purple" ? "text-purple-300" :
                      color === "blue" ? "text-blue-300" :
                      color === "green" ? "text-green-300" :
                      color === "orange" ? "text-orange-300" :
                      "text-cyan-300"
                    }`}>
                      {countMap[title as keyof typeof countMap][option.key]}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getFilterCounts = () => {
    return {
      types: contacts.reduce((acc: any, c) => ({
        ...acc,
        [c.contact_type]: (acc[c.contact_type] || 0) + 1,
      }), {}),
      companies: contacts.reduce((acc: any, c) => ({
        ...acc,
        [c.company || "unspecified"]: (acc[c.company || "unspecified"] || 0) + 1,
      }), {}),
      cities: contacts.reduce((acc: any, c) => ({
        ...acc,
        [c.city || "unspecified"]: (acc[c.city || "unspecified"] || 0) + 1,
      }), {}),
      countries: contacts.reduce((acc: any, c) => ({
        ...acc,
        [c.country || "unspecified"]: (acc[c.country || "unspecified"] || 0) + 1,
      }), {}),
      creators: contacts.reduce((acc: any, c) => ({
        ...acc,
        [c.created_by || "unspecified"]: (acc[c.created_by || "unspecified"] || 0) + 1,
      }), {}),
    };
  };

  const IconChevronUp = require("@tabler/icons-react").IconChevronUp;
  const IconChevronDown = require("@tabler/icons-react").IconChevronDown;
  const IconSearch = require("@tabler/icons-react").IconSearch;

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
        <h1 className="text-4xl font-bold text-white">Contacts</h1>
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

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-zinc-900 rounded-lg border border-zinc-700 p-6 sticky top-8">
            {/* Search */}
            <div className="mb-6">
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<IconSearch size={18} className="text-zinc-400" />}
                classNames={{
                  input: "text-white bg-zinc-800 placeholder-zinc-500",
                  inputWrapper: "bg-zinc-800 border-zinc-700",
                }}
              />
            </div>

            {/* Active Filters */}
            {(filterType || filterCompany || filterCity || filterCountry || filterCreatedBy) && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-zinc-400 uppercase mb-3">Active Filters</p>
                <div className="flex flex-wrap gap-2">
                  {filterType && (
                    <Chip
                      onClose={() => setFilterType("")}
                      variant="flat"
                      className="bg-purple-900/40 text-purple-300"
                    >
                      {filterType}
                    </Chip>
                  )}
                  {filterCompany && (
                    <Chip
                      onClose={() => setFilterCompany("")}
                      variant="flat"
                      className="bg-blue-900/40 text-blue-300"
                    >
                      {filterCompany}
                    </Chip>
                  )}
                  {filterCity && (
                    <Chip
                      onClose={() => setFilterCity("")}
                      variant="flat"
                      className="bg-green-900/40 text-green-300"
                    >
                      {filterCity}
                    </Chip>
                  )}
                  {filterCountry && (
                    <Chip
                      onClose={() => setFilterCountry("")}
                      variant="flat"
                      className="bg-orange-900/40 text-orange-300"
                    >
                      {filterCountry}
                    </Chip>
                  )}
                  {filterCreatedBy && (
                    <Chip
                      onClose={() => setFilterCreatedBy("")}
                      variant="flat"
                      className="bg-cyan-900/40 text-cyan-300"
                    >
                      {allUsers.find((u) => u.id === filterCreatedBy)?.name || filterCreatedBy}
                    </Chip>
                  )}
                </div>
                <Button
                  variant="light"
                  size="sm"
                  className="mt-3 text-red-400 hover:text-red-300"
                  onClick={clearFilters}
                >
                  Clear All
                </Button>
              </div>
            )}

            {/* Filter Sections */}
            <FilterSection
              title="Type"
              options={getTypeOptions()}
              selectedKey={filterType}
              onSelectionChange={setFilterType}
              color="purple"
            />

            <FilterSection
              title="Company"
              options={allCompanies.map((c) => ({ key: c, label: c }))}
              selectedKey={filterCompany}
              onSelectionChange={setFilterCompany}
              color="blue"
            />

            <FilterSection
              title="City"
              options={allCities.map((c) => ({ key: c, label: c }))}
              selectedKey={filterCity}
              onSelectionChange={setFilterCity}
              color="green"
            />

            <FilterSection
              title="Country"
              options={allCountries.map((c) => ({ key: c, label: c }))}
              selectedKey={filterCountry}
              onSelectionChange={setFilterCountry}
              color="orange"
            />

            <FilterSection
              title="Created By"
              options={allUsers.map((u) => ({ key: u.id, label: u.name }))}
              selectedKey={filterCreatedBy}
              onSelectionChange={setFilterCreatedBy}
              color="cyan"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Results Counter */}
          <div className="text-sm text-zinc-300 mb-4 font-medium">
            Showing <span className="text-cyan-400 font-bold">{filteredContacts.length}</span> of{" "}
            <span className="text-cyan-400 font-bold">{contacts.length}</span> contacts
          </div>

          {/* Table */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-700 bg-zinc-800">
                  <th
                    className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-700 text-white font-semibold"
                    onClick={() => handleSort("name")}
                  >
                    Name <SortIcon column="name" />
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-700 text-white font-semibold"
                    onClick={() => handleSort("email")}
                  >
                    Email <SortIcon column="email" />
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-700 text-white font-semibold"
                    onClick={() => handleSort("phone")}
                  >
                    Phone <SortIcon column="phone" />
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-700 text-white font-semibold"
                    onClick={() => handleSort("company")}
                  >
                    Company <SortIcon column="company" />
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-700 text-white font-semibold"
                    onClick={() => handleSort("contact_type")}
                  >
                    Type <SortIcon column="contact_type" />
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-700 text-white font-semibold"
                    onClick={() => handleSort("city")}
                  >
                    City <SortIcon column="city" />
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-700 text-white font-semibold"
                    onClick={() => handleSort("country")}
                  >
                    Country <SortIcon column="country" />
                  </th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Created By</th>
                  <th className="px-4 py-3 text-right text-white font-semibold">Actions</th>
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
                    <tr key={contact.id} className="border-t border-zinc-700 hover:bg-zinc-800/80 transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{contact.name}</td>
                      <td className="px-4 py-3 text-sm text-cyan-300">
                        {contact.email || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-cyan-300">
                        {contact.phone || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">{contact.company || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          contact.contact_type === 'supplier' ? 'bg-purple-900/40 text-purple-300' :
                          contact.contact_type === 'contractor' ? 'bg-orange-900/40 text-orange-300' :
                          contact.contact_type === 'team_member' ? 'bg-green-900/40 text-green-300' :
                          contact.contact_type === 'client' ? 'bg-blue-900/40 text-blue-300' :
                          'bg-zinc-700 text-zinc-300'
                        }`}>
                          {contact.contact_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-white">{contact.city || "-"}</td>
                      <td className="px-4 py-3 text-sm text-white">{contact.country || "-"}</td>
                      <td className="px-4 py-3 text-sm text-zinc-300">
                        {contact.user?.name || contact.created_by || "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="flat"
                            size="sm"
                            className="bg-cyan-900/40 text-cyan-300 hover:bg-cyan-900/60"
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
                            className="bg-red-900/40 text-red-300 hover:bg-red-900/60"
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
        </div>
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
