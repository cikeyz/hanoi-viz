# Hanoi Viz

<p align="center">
  <strong>Watch and auto-solve the Tower of Hanoi with animated disks and rods.</strong><br>
  Vanilla HTML, CSS, and JavaScript. No build step.
</p>

<p align="center">
  <a href="https://case-study-6-dsa-g3.vercel.app/">Live Demo</a>
  &nbsp;&middot;&nbsp;
  <a href="https://cikeyz.github.io/hanoi-viz/">GitHub Pages</a>
  &nbsp;&middot;&nbsp;
  <a href="#quick-start">Quick Start</a>
  &nbsp;&middot;&nbsp;
  <a href="#project-structure">Structure</a>
  &nbsp;&middot;&nbsp;
  <a href="#license">License</a>
</p>

<p align="center">
  <img alt="HTML5" src="https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white">
  <img alt="CSS3" src="https://img.shields.io/badge/CSS3-1572B6?logo=css&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=111111">
  <img alt="License MIT" src="https://img.shields.io/badge/License-MIT-22c55e?logo=open-source-initiative&logoColor=white">
</p>

## Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Other experiments](#other-experiments)
- [License](#license)
- [Course Note](#course-note)

## Overview

Hanoi Viz demonstrates the classic recursive puzzle with interactive disks and an
auto-solve path. Adjust the puzzle, reset state, and follow moves as the solver
runs on the client.

## Features

| Feature | Description |
|---------|-------------|
| Interactive rods | Move disks under Tower of Hanoi rules |
| Auto solve | Animate an optimal recursive solution |
| Reset | Return to a clean starting stack |
| Client-only | No server required |

## Quick Start

```bash
git clone https://github.com/cikeyz/hanoi-viz.git
cd hanoi-viz
python -m http.server 8000
```

Open http://127.0.0.1:8000/

## Project Structure

```text
hanoi-viz/
├── index.html
├── game.js
├── styles.css
├── LICENSE
├── README.md
└── .gitignore
```

## Other experiments

| Branch | Notes |
|--------|-------|
| `experiment/post-final-gamejs` | Alternate `game.js` from archive CS6. Not merged into `main`. |

## License

MIT. See [LICENSE](LICENSE).

## Course Note

Built for CMPE 201 (Data Structures and Algorithms), Polytechnic University of
the Philippines, under Engr. Julius S. Cansino. Final project case study.
Published here as a standalone project.
