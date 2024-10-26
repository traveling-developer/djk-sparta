# DJK Sparta Noris Nürnberg

This is the repository for the DJK Sparta Noris Nürnberg Website.

The finale page can be found here: TBD
The current development state is found [here](https://sparta.debaggu.de/table-tennis/).

The repository is divided into two main sections:
- sanity
    -  Contains all the code for the [sanity](https://www.sanity.io/) Headless Content Management Platform
- webiste
    - Contains all the code for the website which is developed with [astro](https://astro.build/), [tailwindcss](https://tailwindcss.com/) and [daisyUI](https://daisyui.com/)

## Developer notes

### Sanity.io

To extract the schema run:

```bash
npx sanity schema extract
```

To generate the types run:

```bash
npx sanity typegen generate
```


### Website

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |