export default function ParticipantsCard({ participants }) {
  return (
    <section className="card-soft p-5">
      <h2 className="mb-3 font-heading text-lg font-semibold uppercase">Participantes</h2>
      <ul className="space-y-1.5 text-sm">
        {participants.map((p) => (
          <li key={p.id} className="flex justify-between gap-2"><span className="truncate">{p.name}</span><span className="text-xs text-muted-foreground">{p.roleInMeeting}</span></li>
        ))}
      </ul>
    </section>
  );
}