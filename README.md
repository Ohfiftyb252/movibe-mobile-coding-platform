# O.V. World: The Digital Dive Bar
Welcome to O.V. World, your premier digital dive bar for consequence-free bad decisions. Forget the complexities of the real world and immerse yourself in a nonsensical economy fueled by our proprietary crypto-adjacent currency, **O.V. Coin**.
## What is This Place?
O.V. World is a satirical online experience where you can gamble away fake money in a universe that embraces its own stupidity. It's a commentary on crypto-hype, gamified finance, and the absurdity of online worlds, all wrapped in a gritty, retro-tech aesthetic.
## Core Features
*   **O.V. Coin:** The lifeblood of our broken economy. Earn it, lose it, who cares? It's not real.
*   **Guaranteed Rigged Games:** Try your luck at our various locations, where the odds are explicitly not in your favor.
    *   **The Back Alley Arena:** Bet on fixed fights with scripted drama.
    *   **The Crypto Carnival:** Lose your life savings on digital tulips and monkey JPEGs.
    *   **The Data Dump:** Wager on the next corporate data breach. Insider trading is encouraged.
*   **Consequence-Free Bankruptcy:** Lose all your O.V. Coin and get rewarded with a "Pity Party" hat and a fresh stack of coins. Failure is the new success.
*   **Fake Consequences:** Get "arrested" by cool cops who take bribes, or develop a gambling "addiction" that unlocks a mini-game to smash slot machines.
*   **A World That's Intentionally Broken:** We embrace glitches, nonsensical outcomes, and a narrative that makes no sense. It's a feature, not a bug.
## The Philosophy
In a world of high stakes and real consequences, O.V. World offers an escape. A place where nothing matters, everything is stupid, and you can finally relax.
**Disclaimer:** All games are probably rigged. Gamble responsibly (or don't, we don't care). This is not financial advice.

---

## DeskLab by OHFIFTYB (`/desklab`)

Local music asset command center. Drop messy sounds in, get clean sellable kits out.

### What it does

| Step | Action |
| ---- | ------ |
| Import | Drag a folder of WAVs/MP3s onto the drop zone — subdirectories are traversed automatically |
| Scan | Files are auto-classified into Drums, 808s, Loops, Chops, FX by filename keywords |
| Preview | Click any file to hear it instantly via Web Audio |
| Mark | Use keyboard shortcuts (`f` Fire, `k` Keep, `t` Trash, `m` Mutate, `c` Chop, `s` Stack) or the panel buttons |
| Navigate | `↑↓` to move between sounds, `space` to play/stop |
| Build | Switch to **02 Build Pack**, set a pack name, click **Build Pack + Export ZIP** |
| Export | ZIP downloads with organized folders: `01_Drums/`, `02_808s/`, `03_Loops/`, `04_Chops/`, `05_FX/`, `06_Uncategorized/`, `07_License/`, `08_Receipt/` |
| Receipt | `08_Receipt/receipt.json` contains pack name, date, file count, SHA-256 hash, license, and OHFIFTYB tag |

### Test flow

1. Navigate to `/desklab`
2. Drag a folder of sounds onto the drop zone
3. Confirm files appear sorted by category in the list
4. Click a sound — it should play immediately
5. Press `f` on the selected sound — badge updates to **Fire**
6. Press `t` on a bad sound — badge updates to **Trash**
7. Switch to **02 Build Pack**, verify the contents preview shows correct file counts
8. Click **Build Pack + Export ZIP** — browser downloads `<PackName>.zip`
9. Open the ZIP: verify folder structure and that `08_Receipt/receipt.json` is present and valid JSON
10. Switch to **03 Export** and click **Receipt Only** — verify the receipt renders on screen with a correct hash

### Duplicate detection

Files are deduplicated by `filename + filesize`. Re-importing the same folder does not add duplicates.

### Persistence

Sound marks and category overrides survive page refresh via `localStorage` (key: `desklab:marks`). Pack name is also persisted. Use **clear all** in the header to wipe state.

### Export validation

Before ZIP creation, DeskLab checks:
- Pack name must not be empty
- At least one non-trashed sound must exist
- A warning is shown if every file is Uncategorized (does not block export)