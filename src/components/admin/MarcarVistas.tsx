"use client";

import { useTransition } from "react";
import { CheckCheck } from "lucide-react";
import { marcarOportunidadesVistas } from "@/app/admin/actions";

export default function MarcarVistas() {
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} onClick={() => start(() => marcarOportunidadesVistas())} className="btn-secondary !py-1.5 text-sm">
      <CheckCheck size={15} /> Marcar como vistas
    </button>
  );
}
