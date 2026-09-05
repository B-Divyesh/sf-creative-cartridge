# Creative Cartridge demo

Open `/demo` or choose **Try it with sample data** on the front page.

The demo seeds six realistic saved pieces: a rainy-day sound painting, a
four-piece shape story, a six-card cinema, an eight-hit rhythm, Wobblebeak,
and a night pocket theatre. It opens as a populated cartridge, not an empty
setup screen.

The persistent **Demo — sample data, nothing is saved** banner has two
controls:

- **Reset demo** deletes the current demo work and restores the six samples.
- **Start for real** deletes demo work and opens the normal front page.

Demo localStorage keys have a `demo:` prefix, including `demo:cc_parent_pin`
and `demo:cc_selected_activities`. Demo pieces live in the separate
`demo:creative-cartridge` IndexedDB database. Normal data stays in
`creative-cartridge` and unprefixed localStorage keys; demo code never reads
or writes those stores.
