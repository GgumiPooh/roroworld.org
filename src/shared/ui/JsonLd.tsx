export type JsonLdProps = {
  className?: string;
  schema: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function JsonLd({ className, schema }: JsonLdProps) {
  return (
    <script
      className={className}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
