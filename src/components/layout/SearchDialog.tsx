"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, FileText, Network, Search } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { STATUS_META } from "@/lib/constants";
import { APP_NAV } from "@/lib/navigation";
import { TOPICS } from "@/data/topics";
import { useLearningStore } from "@/store/learning-store";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

interface Result {
  id: string;
  kind: "page" | "topic";
  label: string;
  hint: string;
  run: () => void;
}

/** Search across pages and chapter topics. Opening a topic selects it on the knowledge map. */
export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const i18n = useLanguage();
  const router = useRouter();
  const selectTopic = useLearningStore((s) => s.selectTopic);
  const mastery = useLearningStore((s) => s.mastery);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const close = () => {
    setQuery("");
    setActive(0);
    onClose();
  };

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    const pages: Result[] = APP_NAV.filter((n) => n.href).map((n) => ({
      id: `page-${n.href}`,
      kind: "page",
      label: n.label,
      hint: n.section,
      run: () => router.push(n.href!),
    }));
    const topics: Result[] = TOPICS.map((t) => {
      const status = mastery.find((m) => m.topicId === t.id)?.status ?? "not_assessed";
      return {
        id: `topic-${t.id}`,
        kind: "topic",
        label: t.title,
        hint: STATUS_META[status].label,
        run: () => {
          selectTopic(t.id);
          router.push("/knowledge-map");
        },
      };
    });
    const all = [...pages, ...topics];
    return q ? all.filter((r) => r.label.toLowerCase().includes(q)) : all;
  }, [query, mastery, router, selectTopic]);

  const choose = (r: Result | undefined) => {
    if (!r) return;
    r.run();
    close();
  };

  return (
    <Dialog open={open} onClose={close} title="Search" hideTitle className="max-w-lg p-0">
      <div className="flex items-center gap-3 border-b border-line px-4 focus-within:border-purple/60">
        <Search size={17} className="text-muted" aria-hidden="true" />
        <input
          data-autofocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              choose(results[active]);
            }
          }}
          placeholder={i18n.t("Search pages and topics")}
          aria-label={i18n.t("Search pages and topics")}
          aria-controls="search-results"
          aria-activedescendant={results[active] ? `sr-${results[active].id}` : undefined}
          className="h-14 flex-1 bg-transparent text-text placeholder:text-muted focus:outline-none focus-visible:outline-none"
        />
        <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[11px] text-muted">Esc</kbd>
      </div>
      <ul id="search-results" role="listbox" aria-label={i18n.t("Results")} className="max-h-[50vh] overflow-y-auto p-2">
        {results.length === 0 && (
          <li className="px-3 py-8 text-center text-sm text-muted">{i18n.t("Nothing matches “")}{i18n.tx(query)}{i18n.t("”. Try a topic such as friction or net force.")}</li>
        )}
        {results.map((r, i) => (
          <li
            key={r.id}
            id={`sr-${r.id}`}
            role="option"
            aria-selected={i === active}
            onMouseEnter={() => setActive(i)}
            onClick={() => choose(r)}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm",
              i === active ? "bg-purple/15 text-text" : "text-muted",
            )}
          >
            {r.kind === "page" ? <FileText size={16} aria-hidden="true" /> : <Network size={16} aria-hidden="true" />}
            <span className="flex-1 text-text">{i18n.tx(r.label)}</span>
            <span className="text-xs">{i18n.tx(r.kind === "page" ? r.hint : `Topic, ${r.hint.toLowerCase()}`)}</span>
            {i === active && <CornerDownLeft size={14} aria-hidden="true" />}
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
