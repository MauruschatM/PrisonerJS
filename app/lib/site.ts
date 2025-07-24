export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "PrisonerJS",
  description:
    "Experience the classic Prisoner's Dilemma game theory experiment.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Play Game",
      href: "/game",
    },
  ],
  navMenuItems: [
    {
      label: "Game",
      href: "/game",
    },
    {
      label: "Statistics",
      href: "/stats",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help",
      href: "/help",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
