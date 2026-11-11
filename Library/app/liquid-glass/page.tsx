"use client";

import { LiquidGlass } from "@/components/LiquidGlass";
import styles from "./page.module.css";

export default function LiquidGlassLab() {
  return (
    <main className={styles.page} data-theme="dark">
      <header className={styles.header}>
        <p className={styles.eyebrow}>Lab</p>
        <h1 className={styles.title}>Liquid glass</h1>
        <p className={styles.lede}>
          A height field is turned into a surface normal and used to refract a procedural
          backdrop through Snell&rsquo;s law. Reflections are Fresnel-weighted and sampled along
          the reflected view vector, so the rim lights up as the folds turn.
        </p>
      </header>

      <section className={styles.row}>
        <div className={styles.orbCell}>
          <LiquidGlass label="Refractive glass orb" shape="orb" />
        </div>
        <div className={styles.orbCell}>
          <LiquidGlass
            label="Refractive glass orb, polished"
            shape="orb"
            relief={2.1}
            refraction={1.25}
            roughness={0.02}
            dispersion={1}
            scale={0.62}
            seed={31}
          />
        </div>
        <div className={styles.orbCell}>
          <LiquidGlass
            label="Refractive glass orb, smoked"
            shape="orb"
            baseColor="#0c0e14"
            colorA="#b79cff"
            colorB="#3f4a63"
            colorC="#7c8aa8"
            relief={1.6}
            roughness={0.32}
            grain={0.3}
            scale={1.1}
            seed={92}
          />
        </div>
      </section>

      <section className={styles.row}>
        <LiquidGlass className={styles.panel} label="Refractive glass panel" shape="surface" relief={0.6}>
          <h2 className={styles.panelTitle}>Panel surface</h2>
          <p className={styles.panelCopy}>
            The same material without the lens shoulder, so it can carry content at panel scale.
          </p>
        </LiquidGlass>
        <LiquidGlass
          className={styles.panel}
          label="Refractive glass panel, dispersed"
          shape="surface"
          relief={1.1}
          dispersion={1.6}
          refraction={1.4}
          scale={0.7}
          seed={64}
        >
          <h2 className={styles.panelTitle}>High dispersion</h2>
          <p className={styles.panelCopy}>
            Red and blue transmission rays are separated along the folds, the way thick glass
            fringes its edges.
          </p>
        </LiquidGlass>
      </section>
    </main>
  );
}
