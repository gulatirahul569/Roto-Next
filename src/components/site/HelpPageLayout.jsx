import InfoPageLayout from "./InfoPageLayout";

export default function HelpPageLayout({
  title,
  description,
  children,
}) {
  return (
    <InfoPageLayout
      eyebrow="Roto Help Centre"
      title={title}
      description={description}
    >
      {children}
    </InfoPageLayout>
  );
}