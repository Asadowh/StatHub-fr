/**
 * Level System Configuration
 * Matches backend levels.py
 */

export const LEVEL_CONFIG: Record<number, { name: string; color: string }> = {
  1: { name: "Rookie", color: "#9CA3AF" },      // Gray
  2: { name: "Amateur", color: "#10B981" },      // Green
  3: { name: "Rising Star", color: "#3B82F6" },  // Blue
  4: { name: "Professional", color: "#8B5CF6" }, // Purple
  5: { name: "Elite", color: "#F59E0B" },       // Amber/Orange
  6: { name: "Master", color: "#EF4444" },      // Red
  7: { name: "Legend", color: "#EC4899" },      // Pink
  8: { name: "Champion", color: "#14B8A6" },     // Teal
  9: { name: "Icon", color: "#F97316" },       // Orange
  10: { name: "Immortal", color: "#EAB308" },   // Gold/Yellow
};

export function getLevelInfo(level: number): { name: string; color: string } {
  return LEVEL_CONFIG[level] || LEVEL_CONFIG[1];
}

export function getLevelName(level: number): string {
  return getLevelInfo(level).name;
}

export function getLevelColor(level: number): string {
  return getLevelInfo(level).color;
}

