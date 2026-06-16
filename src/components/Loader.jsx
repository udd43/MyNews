export default function Loader({ visible }) {
  return (
    <div className={`loader${visible ? '' : ' hidden'}`}>
      <div className="loader-dot" />
      <div className="loader-dot" />
      <div className="loader-dot" />
    </div>
  );
}
