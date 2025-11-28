"use client";
import { useEffect, useState } from "react";
import { IconWand, IconX } from "@tabler/icons-react";

export default function ColourPicker() {
  const [mounted, setMounted] = useState(false);
  const [activeTheme, setActiveTheme] = useState("purple");
  const [isOpen, setIsOpen] = useState(false);

  const closePopover = () => {
    setIsOpen(false);
  };

  const themes = [
    {
      name: "red",
      colorClass: "bg-red-500",
      primaryColor: "hsl(0 84.2% 60.2%)",
    },
    {
      name: "orange",
      colorClass: "bg-orange-500",
      primaryColor: "hsl(24.6 95% 53.1%)",
    },
    {
      name: "amber",
      colorClass: "bg-amber-500",
      primaryColor: "hsl(45.4 93.4% 47.5%)",
    },
    {
      name: "yellow",
      colorClass: "bg-yellow-500",
      primaryColor: "hsl(50.4 97.8% 63.5%)",
    },
    {
      name: "lime",
      colorClass: "bg-lime-500",
      primaryColor: "hsl(142.1 76.2% 36.3%)",
    },
    {
      name: "green",
      colorClass: "bg-green-500",
      primaryColor: "hsl(142.1 70.6% 45.3%)",
    },
    {
      name: "emerald",
      colorClass: "bg-emerald-500",
      primaryColor: "hsl(160.1 84.1% 39.4%)",
    },
    {
      name: "teal",
      colorClass: "bg-teal-500",
      primaryColor: "hsl(173.4 80.4% 40%)",
    },
    {
      name: "cyan",
      colorClass: "bg-cyan-500",
      primaryColor: "hsl(188.7 94.5% 42.7%)",
    },
    {
      name: "sky",
      colorClass: "bg-sky-500",
      primaryColor: "hsl(199.4 89.1% 48.3%)",
    },
    {
      name: "blue",
      colorClass: "bg-blue-500",
      primaryColor: "hsl(217.2 91.2% 59.8%)",
    },
    {
      name: "indigo",
      colorClass: "bg-indigo-500",
      primaryColor: "hsl(234.5 85.2% 73.3%)",
    },
    {
      name: "violet",
      colorClass: "bg-violet-500",
      primaryColor: "hsl(250.5 95.2% 75.3%)",
    },
    {
      name: "purple",
      colorClass: "bg-purple-500",
      primaryColor: "hsl(262.1 83.3% 57.8%)",
    },
    {
      name: "fuchsia",
      colorClass: "bg-fuchsia-500",
      primaryColor: "hsl(291.7 64.3% 50.3%)",
    },
    {
      name: "pink",
      colorClass: "bg-pink-500",
      primaryColor: "hsl(322.4 84.1% 60.4%)",
    },
    {
      name: "rose",
      colorClass: "bg-rose-500",
      primaryColor: "hsl(346.8 77.2% 49.8%)",
    },
  ];

  const setAccentColor = (themeName: string) => {
    const theme = themes.find((t) => t.name === themeName);
    if (theme) {
      setActiveTheme(themeName);
      // Update CSS custom properties for accent colors
      document.documentElement.style.setProperty(
        "--primary",
        theme.primaryColor
      );
      // Store in localStorage
      localStorage.setItem("accent-color", themeName);
    }
  };

  useEffect(() => {
    setMounted(true);
    // Load saved accent color
    const savedColor = localStorage.getItem("accent-color") || "purple";
    setAccentColor(savedColor);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)}>
        <IconWand size={24} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-64 bg-card border border-border rounded-md shadow-lg">
            <div className="py-3 px-2">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-center font-semibold flex-1 text-card-foreground">
                  Accent Colour
                </h4>
                <button onClick={closePopover}>
                  <IconX size={20} className="text-muted-foreground" />
                </button>
              </div>
              <ul className="grid grid-cols-5 gap-3">
                {themes.map((theme) => (
                  <li key={theme.name}>
                    <div
                      onClick={() => setAccentColor(theme.name)}
                      className={`rounded-full h-5 w-5 cursor-pointer ${theme.colorClass} ${
                        activeTheme === theme.name
                          ? "ring-2 ring-offset-2 ring-offset-background ring-primary"
                          : ""
                      }`}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
