export const PixelGameLabel = ({ system, color }: { system: string; color: string }) => {
  const space = ["GameCube", "PlayStation", "PlayStation 2", "Dreamcast", "PSP"].includes(system);
  return <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges">
    <rect width="160" height="100" fill={space ? "#16113e" : "#418de3"} />
    {space ? <>
      {[ [12, 12], [38, 30], [72, 10], [124, 15], [145, 48], [28, 70], [100, 80], [60, 60] ].map(([x,y],i) => <path key={i} d={`M${x} ${y}h3v3h-3Z`} fill={i % 2 ? "#f9d49b" : "#afa6f9"} />)}
      <path d="M86 24h26v6h12v10h6v22h-6v10h-12v6H86v-6H74V62h-6V40h6V30h12Z" fill="#7770db" />
      <path d="M88 30h18v6h-12v12H82V36h6Zm18 24h18v12h-12v6h-12V60h6Z" fill="#b3a6ef" />
      <path d="m42 70 12-12h18v6H60v6h-6v6h-6v6h30v-6h18v-6h18v-6h12v-6h12v-6h8v6h-8v6h-6v6h-12v6h-12v6H90v6H60v-6H42Z" fill="#d7b8f7" />
    </> : <>
      <path d="M10 15h8v-5h14v5h8v9H10Zm99 13h8v-6h13v6h9v8h-30Z" fill="#e7f5ff" />
      <path d="M0 75V59h12V47h15V38h20v9h12v15h15v13Zm87 0V55h13V43h16V32h19v11h14v16h11v16Z" fill="#287b44" />
      <path d="M12 65V53h15V42h15v16h-9v7Zm92 0V48h12V37h14v20h-14v8Z" fill="#55b647" />
      <path d="M0 75h160v25H0Z" fill="#ae732c" />
      {Array.from({length: 10}, (_, i) => <rect key={i} x={i * 16} y={i % 2 ? 90 : 81} width="8" height="8" fill="#e0aa47" />)}
      <path d="M0 72h160v7H0Z" fill="#8bdd45" /><path d="M0 79h160v4H0Z" fill="#3a562d" />
      <path d="M73 39h13v6h6v17h-6v8H72v-8h-5V45h6Z" fill={color} />
      <path d="M73 45h4v5h-4Zm10 0h4v5h-4Z" fill="#fff7d8" />
    </>}
  </svg>;
};
