import { defineField, defineType } from 'sanity'


export default defineType({
    name: 'news',
    title: 'News',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            type: 'string',
            title: 'Titel',
            validation: rule => rule.required()
        }),
        defineField({
            name: 'content',
            type: 'text',
            title: 'Inhalt',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'category',
            type: 'string',
            title: 'Kategorie',
            initialValue: 'general',
            options: {
                list: [
                    { title: 'Allgemein', value: 'general' },
                    { title: 'Fußball', value: 'soccer' },
                    { title: 'Gesundheitssport', value: 'health-sport' },
                    { title: 'Indiaca', value: 'indiaca' },
                    { title: 'Tennis', value: 'tennis' },
                    { title: 'Tischtennis', value: 'table-tennis' },
                ],
            },
            validation: (rule) => rule.required(),
        }),
        defineField({
            title: 'Veröffentlichungsdatum',
            name: 'releaseDate',
            type: 'date',
            initialValue: () => new Date().toISOString().split('T')[0],
            options: {
                dateFormat: 'DD-MM-YYYY',
            },
            validation: (rule) => rule.required(),
        })
    ],
});