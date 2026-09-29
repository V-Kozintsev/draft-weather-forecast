import type { ReactNode } from "react";

/** @param {{eyebrow: string, title: string, id: string, children?: ReactNode}} props - Подпись, заголовок, доступный идентификатор и дополнительный индикатор. @returns {JSX.Element} Общая шапка информационной карточки. */
export default function PanelHeading({
  eyebrow,
  title,
  id,
  children,
}: {
  eyebrow: string;
  title: string;
  id: string;
  children?: ReactNode;
}) {
  return (
    <div className="panel-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id}>{title}</h2>
      </div>
      {children}
    </div>
  );
}
