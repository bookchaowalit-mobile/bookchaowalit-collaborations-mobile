import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  countByStatus,
  filterCollabs,
  isCollaboration,
  SAMPLE_COLLABS,
  STATUSES,
  transition,
  TRANSITIONS,
  validateNew,
  type Collaboration,
  type Status,
} from "../../lib/collabs";
import { listCodec } from "../../lib/persist";
import { usePersistentState } from "../../lib/usePersistentState";

const collabsCodec = listCodec(isCollaboration);

const COLOR: Record<Status, string> = {
  proposed: "#5F6B7A",
  negotiating: "#8A5A00",
  active: "#2A5A8C",
  completed: "#1B7F3B",
  declined: "#B00020",
};

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CollaborationsScreen() {
  const [items, setItems] = usePersistentState<Collaboration[]>("collabs.items.v1", SAMPLE_COLLABS, collabsCodec);
  const [status, setStatus] = useState<Status | null>(null);
  const [query, setQuery] = useState("");
  const [partner, setPartner] = useState("");
  const [project, setProject] = useState("");
  const [error, setError] = useState<string | null>(null);

  const counts = countByStatus(items);
  const visible = filterCollabs(items, { status, query });

  const add = () => {
    const problem = validateNew(partner, project, items);
    setError(problem);
    if (problem) return;
    setItems([...items, { id: `${Date.now()}`, partner: partner.trim(), project: project.trim(), status: "proposed", updatedAt: today() }]);
    setPartner("");
    setProject("");
  };

  const move = (c: Collaboration, to: Status) => setItems(items.map((i) => (i.id === c.id ? transition(c, to, today()) : i)));

  return (
    <FlatList
      style={styles.container}
      data={visible}
      keyExtractor={(c) => c.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Propose a collaboration</Text>
            <TextInput style={styles.input} placeholder="Partner" value={partner} onChangeText={setPartner} accessibilityLabel="Partner" />
            <TextInput style={styles.input} placeholder="Project" value={project} onChangeText={setProject} accessibilityLabel="Project" />
            {error && <Text style={styles.error}>{error}</Text>}
            <Pressable style={styles.button} onPress={add} accessibilityRole="button" accessibilityLabel="Add collaboration">
              <Text style={styles.buttonText}>Add as proposed</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Search partner, project or notes"
            value={query}
            onChangeText={setQuery}
            accessibilityLabel="Search collaborations"
          />
          <View style={styles.chips}>
            <Chip label={`All (${items.length})`} a11yLabel={`All statuses, ${items.length}`} active={status === null} onPress={() => setStatus(null)} />
            {STATUSES.map((s) => (
              <Chip
                key={s}
                label={`${s} (${counts[s]})`}
                a11yLabel={`Filter ${s}, ${counts[s]}`}
                active={status === s}
                onPress={() => setStatus(status === s ? null : s)}
              />

            ))}
          </View>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>No collaborations here.</Text>}
      renderItem={({ item }) => (
        <View style={[styles.card, styles.item, { borderLeftColor: COLOR[item.status] }]}>
          <Text style={styles.project}>{item.project}</Text>
          <Text style={styles.meta}>
            {item.partner} · updated {item.updatedAt}
          </Text>
          <Text style={[styles.status, { color: COLOR[item.status] }]}>{item.status}</Text>
          {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
          {TRANSITIONS[item.status].length > 0 && (
            <View style={styles.chips}>
              {TRANSITIONS[item.status].map((to) => (
                <Pressable
                  key={to}
                  style={[styles.move, { borderColor: COLOR[to] }]}
                  onPress={() => move(item, to)}
                  accessibilityRole="button"
                  accessibilityLabel={`Move ${item.project} to ${to}`}
                >
                  <Text style={[styles.moveText, { color: COLOR[to] }]}>→ {to}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}
    />
  );
}

function Chip({
  label,
  a11yLabel,
  active,
  onPress,
}: {
  label: string;
  a11yLabel?: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel ?? label}
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: { padding: 16, gap: 10 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, gap: 8, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  error: { color: "#B00020" },
  button: { backgroundColor: "#4A90D9", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: "#E3ECF7" },
  chipActive: { backgroundColor: "#4A90D9" },
  chipText: { color: "#2A5A8C", fontWeight: "500", textTransform: "capitalize" },
  chipTextActive: { color: "#fff" },
  empty: { textAlign: "center", color: "#888", marginTop: 24 },
  item: { marginHorizontal: 16, marginBottom: 10, borderLeftWidth: 5, gap: 4 },
  project: { fontSize: 16, fontWeight: "600", color: "#333" },
  meta: { fontSize: 13, color: "#777" },
  status: { fontSize: 13, fontWeight: "700", textTransform: "capitalize" },
  notes: { fontSize: 13, color: "#555", fontStyle: "italic" },
  move: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  moveText: { fontSize: 13, fontWeight: "600" },
});
