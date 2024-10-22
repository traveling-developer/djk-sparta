import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'soccerTeam',
    title: 'Fußball Mannschaft',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
        }),
        defineField({
            name: 'trainerName',
            title: 'Trainer Name',
            type: 'string',
        }),
        defineField({
            name: 'trainerMail',
            title: 'Trainer Mail',
            type: 'string',
        }),
        defineField({
            name: 'trainingLocation',
            title: 'Trainingsort',
            type: 'text',
        }),
        defineField({
            name: 'trainingTimes',
            title: 'Trainingszeiten',
            type: 'text',
        }),
    ],
    preview: {
        select: {
            title: 'name',
            media: 'image',
        },
    },
})
