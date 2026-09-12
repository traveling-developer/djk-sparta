export const club = {
  name: "DJK Sparta Noris Nürnberg e.V.",
  shortName: "DJK Sparta Noris",

  foundedYear: 1918,
  fusionYear: 1954,

  memberCount: 500,
  memberCountDisplay: "~500",
  departmentCount: 5,
  teamCount: 18,

  address: {
    street: "Wacholderweg 60",
    postalCode: "90441",
    city: "Nürnberg",
    district: "Weiherhaus",
  },

  contact: {
    phone: "+49 911 480 59 55",
    phoneTel: "tel:+499114805955",
    email: "info@djkspartanoris.de",
    emailMailto: "mailto:info@djkspartanoris.de",
  },

  coordinates: {
    latitude: 49.416459843204485,
    longitude: 11.068967769662304,
  },

  officeHours: [
    { dayOfWeek: "Friday", dayLabel: "Fr", opens: "08:00", closes: "12:00" },
  ],
  officeHoursNote: "oder nach Vereinbarung",

  social: {
    facebook: "https://www.facebook.com/djkspartanoris",
    instagram: "https://www.instagram.com/djk_sparta_noris_nbg",
  },
} as const;

export interface OfficeHours {
  dayLabel: string;
  opens: string;
  closes: string;
}

export function formatOfficeHours(hours: OfficeHours): string {
  const clock = (time: string) => {
    const [hour, minute] = time.split(":");
    return minute === "00" ? String(Number(hour)) : `${Number(hour)}:${minute}`;
  };
  return `${hours.dayLabel} · ${clock(hours.opens)} - ${clock(hours.closes)} Uhr`;
}
