# Scientific sources, image provenance and rights

Audit date: **30 October 2026**. This is a source/provenance record, not independent scientific approval or legal clearance for every intended use. No partnership, approval or endorsement by NASA, ESA, CSA, STScI, OpenStax or a university is claimed.

## Media registry

`public/images/attributions.json` is the canonical bilingual registry. It records title, caption, alt text, source, download URL, credit, observation/illustration classification and check date. The files are locally cached WebP derivatives of the identified products; they are not generated “telescope observations.” Images may be resized, compressed or cropped for cards, with their scientific identity retained in the accompanying metadata.

| Local asset      | Identified product / classification                                                                                                                  | Credit retained                                                             | Original source                                                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `carina.webp`    | Webb/NIRCam Cosmic Cliffs, NGC 3324; processed infrared observations with assigned visible colours                                                   | NASA, ESA, CSA, STScI                                                       | [NASA image product](https://science.nasa.gov/asset/webb/cosmic-cliffs-in-the-carina-nebula-nircam-image/)                                      |
| `saturn.webp`    | Cassini _Jewel of the Solar System_, PIA17474; natural-colour observational mosaic, observations 10 October 2013                                     | NASA/JPL-Caltech/Space Science Institute/Cornell                            | [NASA Science product](https://science.nasa.gov/image-detail/amf-pia17474/) and [NASA Images archive](https://images.nasa.gov/details/PIA17474) |
| `earth.webp`     | LRO Earthrise; composite using narrow-angle detail and wide-angle colour, **not** Apollo 17 Blue Marble                                              | NASA/Goddard/Arizona State University                                       | [NASA archive e000496](https://images.nasa.gov/details/GSFC_20171208_Archive_e000496)                                                           |
| `andromeda.webp` | Detail from the Hubble Andromeda panorama product in the NASA archive                                                                                | NASA, ESA, and G. Bacon (STScI)                                             | [NASA archive e000833](https://images.nasa.gov/details/GSFC_20171208_Archive_e000833)                                                           |
| `moon.webp`      | Scientific visualization using LRO/LOLA/LROC terrain data; **data-based rendering**, not a single telescope photograph or a current-phase prediction | NASA/Goddard Scientific Visualization Studio · Ernie Wright · LRO/LOLA/LROC | [NASA SVS 4236](https://svs.gsfc.nasa.gov/4236/)                                                                                                |

NASA archive metadata is saved in `source-audit-media.json`. For Saturn, the NASA Science page credits NASA/JPL-Caltech/Space Science Institute, while the download archive's `secondary_creator` includes `SSI/Cornell`. The registry retains the **fuller archive credit including Cornell**, and records that discrepancy explicitly. The three matching pending-pilot lesson image records were corrected without changing learning records or claiming scientific approval.

The 2017 dates in some NASA archive IDs/metadata are archive/upload dates, not asserted acquisition dates. Webb's displayed visible colours encode infrared filters. The Moon model uses an existing scientific rendering as a texture; it does not claim today's observational geometry. Solar-system bodies other than the identified Cassini image are CSS/SVG educational illustrations.

### Usage policies checked

- [NASA Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/): provides educational/informational usage guidance, attribution requirements, third-party exceptions and restrictions on misleading endorsement/promotional use. NASA hosting does **not** automatically transfer third-party rights, and logos/identifiers have separate protections.
- [ESA image/video terms](https://www.esa.int/ESA_Multimedia/Terms_and_conditions_of_use_of_images_and_videos_available_on_the_esa_website): distinguishes educational/editorial/informational use, required copyright credits, third-party materials, asset-specific Creative Commons licences and commercial permissions. General ESA-site terms do not establish a blanket commercial licence for every jointly credited product downloaded from another archive.

Before a public/commercial release, retain per-asset permission/rights evidence for the actual context (including promotional hero placements), verify all partner credits and any required copyright notation, and replace an asset if rights cannot be established. A credit line is not a licence. Do not relicense the media as application code or imply institutional sponsorship. No NASA/ESA logos are used as the academy's brand mark.

NASA's guidance also distinguishes source disclosure from institutional authorship/validation of generated output. ASTRO AI responses must be identified as ASTRO AI output. Linked original sources are reading references, not proof that NASA authored, checked, permitted or endorsed a generated explanation. The tutor system instructions reflect that distinction; independent review is still necessary.

## Teaching references

The registry in `src/content/references.ts` links to original scientific/educational resources, including:

- OpenStax _Astronomy 2e_, Andrew Fraknoi, David Morrison and Sidney C. Wolff: nature of astronomy/science; numerical scales; ancient/modern astronomy; spectral lines; distance measurement.
- NASA Science topic pages for the universe, Solar System, stars and black holes.
- NASA/ESA/CSA/STScI's specific Webb image product, rather than an invented research-paper citation.

Lesson prose, investigations and application diagrams were prepared for this pilot, not copied as a redistribution of the OpenStax textbook. The tutor retrieves academy-authored content from the database; it does not scrape third-party pages or insert their complete text into a model context.

The OpenStax planetary-data appendix accessed during the audit displayed a **CC BY-NC-SA 4.0** notice and separate commercial/AI-use permission restrictions. Do not assume the entire current edition is CC BY 4.0 or that a source link grants commercial redistribution or AI-training/ingestion rights. Check the current page/book terms and obtain permission where needed before adding third-party excerpts, translations or source documents. Reference: [OpenStax physical/orbital data appendix](https://openstax.org/books/astronomy-2e/pages/f-physical-and-orbital-data-for-the-planets).

Link checks are recorded in `source-link-audit.json` and `additional-source-link-audit.json`. HTTP 200 verifies only that a URL was reachable at the recorded time; it does not establish scientific accuracy, suitability, stable future availability or usage permission.

## Numerical conventions

Planet data is documented in `src/content/planets.ts` and `planet-fact-audit.json`.

- Mean radius is the volumetric/equal-volume radius, not an unlabeled mixture of equatorial and mean radii.
- Orbital periods are **sidereal**, consistently rounded from the individual NASA planetary fact sheets. They are not silently mixed with tropical periods.
- Reference gravity is effective equatorial acceleration including rotation. For giant planets, reference levels are associated with approximately 1 bar, not a solid surface.
- Reference temperatures use NASA's rounded comparison values; giant-planet values must not be described as surface temperatures.
- Semimajor-axis/AU figures and rotation rates are rounded reference conventions, not precision navigation data. Giant-planet rotation is reference-dependent.

Primary numerical references: [NASA planetary fact-sheet index](https://nssdc.gsfc.nasa.gov/planetary/factsheet/index.html), [fact-sheet notes](https://nssdc.gsfc.nasa.gov/planetary/factsheet/fact_notes.html), each planet's individual fact sheet, and [NASA Solar System temperatures](https://science.nasa.gov/solar-system/temperatures-across-our-solar-system/).

Common lesson scales are explicitly approximate: c ≈ 3×10⁵ km/s; AU ≈ 1.496×10¹¹ m; light-year ≈ 9.461×10¹⁵ m; parsec ≈ 3.086×10¹⁶ m ≈ 3.262 light-years. A unit's exact definition and a rounded teaching value must not be conflated.

Observatory orbits use circular, coplanar paths, arbitrary initial phases and rescaled distances/sizes. The Moon cycle uses a simplified 29.53-day synodic period, not an ephemeris. Constellation diagrams are schematic, not position-accurate sky maps. The black-hole tool uses the nonrotating, uncharged Schwarzschild approximation. All require appropriate limitations when used for teaching.

## Fonts and software

Inter and Cairo are served locally. Their SIL Open Font License notices are included at `public/fonts/Inter-OFL.txt` and `public/fonts/Cairo-OFL.txt`; retain them when distributing the fonts.

Application dependencies retain their respective package licences. `package-lock.json` fixes the verified dependency set. The project is marked private; no blanket licence or ownership claim over scientific media, source publications, partner trademarks or dependency code is made by this delivery. Select an appropriate licence for your own application before publishing it as an open-source project.

## Review status

**All pilot lesson/question science and Arabic editorial approvals remain PENDING.** Software validators, image metadata checks and numerical spot checks are not an independent subject-matter review. Preserve reviewer decisions, version IDs, calculation checks and rights evidence before enabling a reviewed public release.
