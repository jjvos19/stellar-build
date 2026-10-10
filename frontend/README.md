This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Istalar y compilar el Binding

Compilar el contrato para generar el *./dist*

```bash
 pnpm install

   ╭──────────────────────────────────────────╮
   │                                          │
   │   Update available! 10.20.0 → 12.10.1.   │
   │   Changelog: https://pnpm.io/v/12.10.1   │
   │     To update, run: pnpm self-update     │
   │                                          │
   ╰──────────────────────────────────────────╯

Progress: resolved 1, reused 0, downloaded 0, added 0
Progress: resolved 4, reused 2, downloaded 0, added 0
Progress: resolved 14, reused 10, downloaded 2, added 0
Progress: resolved 14, reused 10, downloaded 3, added 0
Progress: resolved 15, reused 10, downloaded 3, added 0
Progress: resolved 17, reused 11, downloaded 4, added 0
Progress: resolved 28, reused 22, downloaded 5, added 0
Progress: resolved 29, reused 23, downloaded 5, added 0
Progress: resolved 30, reused 23, downloaded 5, added 0
Progress: resolved 38, reused 31, downloaded 5, added 0
Progress: resolved 40, reused 34, downloaded 5, added 0
Progress: resolved 42, reused 36, downloaded 5, added 0
Progress: resolved 43, reused 36, downloaded 5, added 0
Packages: +44
++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved 44, reused 38, downloaded 5, added 41
Progress: resolved 44, reused 38, downloaded 5, added 43
Progress: resolved 44, reused 38, downloaded 6, added 43
Progress: resolved 44, reused 38, downloaded 6, added 44, done

dependencies:
+ @stellar/stellar-sdk 16.3.1 (17.2.1 is available)
+ buffer 6.0.3

devDependencies:
+ typescript 5.9.3 (7.0.2 is available)

Done in 1m 2.7s using pnpm v10.20.0
```

```bash
 pnpm build

> buy-jerrycan-gasoline@0.0.0 build D:\Desarrollo\blockchain\stellar\s-elite\stellar-build\libs-react\stellar\packages\buy-jerrycan-gasoline
> tsc
```

## Linkear la libreria al frontend

Ingresar hasta el directorio del frontend y ejecutar el comando

```bash
pnpm add link:../libs-react/stellar/packages/buy-jerrycan-gasoline/

Progress: resolved 0, reused 1, downloaded 0, added 0
Progress: resolved 24, reused 24, downloaded 0, added 0
Progress: resolved 255, reused 255, downloaded 0, added 0
Progress: resolved 436, reused 436, downloaded 0, added 0
Progress: resolved 506, reused 482, downloaded 0, added 0
Progress: resolved 558, reused 486, downloaded 0, added 0
Progress: resolved 561, reused 487, downloaded 2, added 0
Progress: resolved 562, reused 487, downloaded 2, added 0
Progress: resolved 567, reused 487, downloaded 5, added 0
Progress: resolved 575, reused 494, downloaded 7, added 0
Progress: resolved 576, reused 496, downloaded 7, added 0
 WARN  3 deprecated subdependencies found: glob@7.1.7, highlight.js@8.9.1, inflight@1.0.6
Already up to date
Progress: resolved 577, reused 497, downloaded 7, added 0, done

dependencies:
+ buy-jerrycan-gasoline 0.0.0 <- ..\libs-react\stellar\packages\buy-jerrycan-gasoline

Done in 11.7s using pnpm v10.20.0
```

Adicionar el api de freighter.

```bash
 pnpm add @stellar/freighter-api
 ERR_PNPM_UNEXPECTED_VIRTUAL_STORE  Unexpected virtual store location

The dependencies at "D:\Desarrollo\blockchain\stellar\s-elite\stellar-build\frontend\node_modules" are currently symlinked from the virtual store directory at "D:\Desarrollo\nodejs\frontend\node_modules\.pnpm".

pnpm now wants to use the virtual store at "D:\Desarrollo\blockchain\stellar\s-elite\stellar-build\frontend\node_modules\.pnpm" to link dependencies from the store.

If you want to use the new virtual store location, reinstall your dependencies with "pnpm install".

You may change the virtual store location by changing the value of the virtual-store-dir config
```

