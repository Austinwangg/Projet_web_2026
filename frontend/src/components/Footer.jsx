import Logo from './Logo.jsx';

export default function Footer({ T }) {
  return (
    <footer className="vv-footer">
      <div className="container">
        <div className="cols">
          <div>
            <Logo />
            <p style={{ marginTop: 16, fontSize: 13.5, color: 'var(--ink-soft)', maxWidth: 320 }}>
              {T.footer.blurb}
            </p>
          </div>
          {T.footer.cols.map(col => (
            <div key={col.t}>
              <h5>{col.t}</h5>
              <ul>
                {col.items.map(i => <li key={i}><a>{i}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="vv-footer-bot">
          <span>{T.footer.legal}</span>
          <span>FR · EN · BUILT WITH REACT + PHP/MYSQL</span>
        </div>
      </div>
    </footer>
  );
}
