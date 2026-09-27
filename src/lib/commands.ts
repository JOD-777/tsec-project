import { procedures } from "./procedures";
import { translateText, type Language } from "./translations";

export type CivicCommand = { id: string; title: string; group: string; keywords: string; href?: string; theme?: "light" | "dark" | "system" };
export const civicCommands: CivicCommand[] = [
  ...[["/", "Home"], ["/services", "Explore services"], ["/demo", "Create a sample goal"], ["/app", "My roadmaps"], ["/admin", "Admin review console"], ["/how-it-works", "How it works"]].map(([href, title]) => ({ id: href, title, href, group: "Navigate", keywords: title })),
  ...procedures.flatMap((procedure) => [
    { id: `service-${procedure.id}`, title: procedure.title, href: `/services/${procedure.id}`, group: "Services", keywords: procedure.jurisdiction + " " + procedure.description },
    ...[["roadmap", "Roadmap"], ["what-if", "What-if comparison"], ["documents", "Document readiness"], ["print", "Print / Save as PDF"]].map(([tool, label]) => ({ id: `${tool}-${procedure.id}`, title: `${procedure.title} · ${label}`, href: `/app/goals/${procedure.id}/${tool}`, group: "Roadmap tools", keywords: procedure.jurisdiction })),
  ]),
  ...(["light", "dark", "system"] as const).map((theme) => ({ id: `theme-${theme}`, title: `Use ${theme} theme`, theme, group: "Appearance", keywords: "colour color appearance" })),
];
export function searchCommands(query: string, locale: Language = "en") {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return civicCommands.filter((command) => words.every((word) => `${command.title} ${command.group} ${command.keywords} ${translateText(locale, command.title)} ${translateText(locale, command.group)} ${translateText(locale, command.keywords)}`.toLocaleLowerCase().includes(word)));
}
