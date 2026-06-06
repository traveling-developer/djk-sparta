import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Wiederverwendbarer Rich-Text-Typ (Portable Text) für Artikelinhalte.
 * Kein h1 — der Titel ist ein eigenes Dokumentfeld.
 */
export default defineType({
  name: 'blockContent',
  title: 'Rich Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Absatz', value: 'normal'},
        {title: 'Überschrift 2', value: 'h2'},
        {title: 'Überschrift 3', value: 'h3'},
        {title: 'Überschrift 4', value: 'h4'},
        {title: 'Zitat', value: 'blockquote'},
      ],
      lists: [
        {title: 'Aufzählung', value: 'bullet'},
        {title: 'Nummerierung', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Fett', value: 'strong'},
          {title: 'Kursiv', value: 'em'},
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              defineField({
                name: 'href',
                type: 'url',
                title: 'URL',
                validation: (rule) =>
                  rule
                    .required()
                    .uri({scheme: ['http', 'https', 'mailto', 'tel']}),
              }),
            ],
          }),
        ],
      },
    }),
    // Inline-Bilder vorerst deaktiviert. Zum Reaktivieren einkommentieren und:
    // - NEWS-Query in website/src/lib/news.ts wieder um die content[]-Projektion
    //   mit "url": asset->url ergänzen
    // - PortableTextImage in website/src/pages/news/[slug].astro wieder einbinden
    // - Typegen neu generieren (schema extract + typegen generate)
    // defineArrayMember({
    //   type: 'image',
    //   title: 'Bild',
    //   options: {hotspot: true},
    //   fields: [
    //     defineField({
    //       name: 'alt',
    //       type: 'string',
    //       title: 'Alternativtext',
    //       description: 'Kurze Bildbeschreibung für Screenreader und SEO.',
    //     }),
    //   ],
    // }),
  ],
})
