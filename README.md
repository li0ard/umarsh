<p align="center">
    <b>@li0ard/umarsh</b><br>
    <b>Umarsh (transit pass system) parser</b>
    <br>
    <a href="https://li0ard.is-cool.dev/umarsh">docs</a>
    <br><br>
    <!--
    <a href="https://github.com/li0ard/umarsh/actions/workflows/test.yml"><img src="https://github.com/li0ard/umarsh/actions/workflows/test.yml/badge.svg" /></a>
    <a href="https://github.com/li0ard/umarsh/blob/main/LICENSE"><img src="https://img.shields.io/github/license/li0ard/umarsh" /></a>
    <br>
    <a href="https://npmjs.com/package/@li0ard/umarsh"><img src="https://img.shields.io/npm/v/@li0ard/umarsh" /></a>
    <br>
    -->
    <hr>
</p>

[Umarsh](https://umarsh.ru) (Умарш, short for "Удобный маршрут", which traslates to "convenient route") - developer of public transport transit pass system. It delivers turnkey projects for numerous regions (Omsk, Nizhny Novgorod, Yekaterinburg, etc.)

## Parser

### Installation

```bash
npm i @li0ard/umarsh
```

### Examples

```ts
import { BitmapB, IDSector } from "@li0ard/umarsh";

const transport = Uint8Array.fromHex("FFFFFF7F.....25");
console.log(new BitmapB(transport).toString());

const lasttrip = Uint8Array.fromHex("25F33472363900000000363035300000");
console.log(new IDSector(lasttrip));
```

## Cards

### Keys

| Sector |                            Description                           |                                     Keys                                     |
|:------:|:----------------------------------------------------------------:|:----------------------------------------------------------------------------:|
|    0   | Manufacturer block, last trip block (isn't used on every region) |              Key A static per region. Key B diversified from UID             |
|    1   |             Unused. High-entropy blob or zero-filled             |                           Key A/B static per region                          |
|    2   |             Unused. High-entropy blob or zero-filled             |                           Key A/B static per region                          |
|    3   |             Unused. High-entropy blob or zero-filled             |                           Key A/B static per region                          |
|    4   |             Unused. High-entropy blob or zero-filled             |                           Key A/B static per region                          |
|    5   |             Unused. High-entropy blob or zero-filled             |                           Key A/B static per region                          |
|    6   |             Unused. High-entropy blob or zero-filled             |                           Key A/B static per region                          |
|    7   |             Unused. High-entropy blob or zero-filled             |                           Key A/B static per region                          |
|    8   |                         Transport layout                         | Key A static per region. Key B diversified from UID, required to read sector |
|    9   |             Unused. High-entropy blob or zero-filled             |                           Key A/B static per region                          |
|   10   |             Unused. High-entropy blob or zero-filled             |                           Key A/B static per region                          |
|   11   |             Unused. High-entropy blob or zero-filled             |                           Key A/B static per region                          |
|   12   |             Unused. High-entropy blob or zero-filled             |                           Key A/B static per region                          |
|   13   |             Unused. High-entropy blob or zero-filled             |                           Key A/B static per region                          |
|   14   |             Unused. High-entropy blob or zero-filled             |                           Key A/B static per region                          |
|   15   |             Unused. High-entropy blob or zero-filled             |                           Key A/B static per region                          |

### Datetime encoding

- Date is a packed date with 7 bits for year (based on 2000), 4 for month and 5 for day
- Time is a packed time where value is `hours * 100 + minutes`

### Last trip block (aka ID Sector)

Sector 0, block 1. Everything is big-endian

| Start bit | End bit | Length in bits | Purpose
|-----------|---------|----------------|---------
| 0         | 3       | 4              | Transport type
| 4         | 15      | 12             | Pay time (see above)
| 16        | 31      | 16             | Pay date (see above)
| 32        | 79      | 48             | Route number (in ASCII)
| 80        | 127     | 48             | Transport number (in ASCII)


### Transport layout (aka BitmapB)

Whole sector 8. Everything is big-endian.

WIP
| Start bit | End bit | Length in bits | Purpose
|-----------|---------|----------------|---------
| - | - | - | - |


## Acknowledgements
- [Metrodroid](https://github.com/metrodroid/metrodroid) contributors (especially [Vladimir Serbinenko](https://github.com/phcoder))
- [Deevilleto](https://habr.com/ru/users/Deevilleto/) for helping with reverse engineering 