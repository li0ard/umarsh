<p align="center">
    <b>@li0ard/umarsh</b><br>
    <b>Umarsh (transit pass system) parser</b>
    <!--<br>
    <a href="https://li0ard.is-cool.dev/umarsh">docs</a>-->
    <br><br>
    <a href="https://github.com/li0ard/umarsh/actions/workflows/test.yml"><img src="https://github.com/li0ard/umarsh/actions/workflows/test.yml/badge.svg" /></a>
    <a href="https://github.com/li0ard/umarsh/blob/main/LICENSE"><img src="https://img.shields.io/github/license/li0ard/umarsh" /></a>
    <br>
    <a href="https://npmjs.com/package/@li0ard/umarsh"><img src="https://img.shields.io/npm/v/@li0ard/umarsh" /></a>
    <br>
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

## Definitions

### Keys & sectors

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

| Start bit | End bit | Length in bits |                                 Purpose                                |
|:---------:|:-------:|:--------------:|:----------------------------------------------------------------------:|
| 0         | 127     | 128            | Irreversible value (as Mifare Value Block). Purpose not entirely clear |
| 128       | 128     | 1              | Processing method of block 4. Purpose not entirely clear               |
| 129       | 130     | 2              | Card technological type (eg. Passenger, Operator)                      |
| 133       | 135     | 2              | Bitmap version                                                         |
| 136       | 151     | 16             | Card expiration date (see above)                                       |
| 152       | 167     | 16             | Reserved for LT as `expireDateNextPeriod`                              |
| 168       | 174     | 7              | Initial zone                                                           |
| 175       | 175     | 1              | Zone presentation                                                      |
| 176       | 182     | 7              | Final zone                                                             |
| 184       | 191     | 8              | Offline counter                                                        |
| 192       | 219     | 28             | Card number                                                            |
| 197       | 199     | 3              | Region code (HI)                                                       |
| 224       | 227     | 4              | Region code (LO)                                                       |
| 228       | 231     | 4              | Last operation terminal type                                           |
| 232       | 238     | 7              | Card series                                                            |
| 240       | 246     | 7              | Product type (also discount percent for EP if <= 99)                   |
| 247       | 247     | 1              | Personal card flag                                                     |
| 248       | 255     | 8              | Transport type mask                                                    |
| 256       | 271     | 16             | Transit pass expiration/activate date (see above)                      |
| 272       | 278     | 7              | Validity period                                                        |
| 279       | 279     | 1              | Activation state flag                                                  |
| 280       | 303     | 24             | Last operation terminal number                                         |
| 304       | 319     | 16             | Last operation date (see above)                                        |
| 320       | 343     | 24             | Balance part (Custom for each card type)                               |
| 327       | 327     | 1              | Transaction parity                                                     |
| 343       | 343     | 1              | Lock state flag                                                        |

### Balance parts
#### EP - Electronic purse
| Start bit | End bit | Length in bits |       Purpose       |
|:---------:|:-------:|:--------------:|:-------------------:|
| 320       | 326     | 7              | Balance. Units (HI) |
| 328       | 335     | 8              | Balance. Units (LO) |
| 336       | 342     | 7              | Balance. Fractional |

#### SU - Season unlimited
| Start bit | End bit | Length in bits |        Purpose        |
|:---------:|:-------:|:--------------:|:---------------------:|
| 320       | 326     | 7              | Pass cost. Units (HI) |
| 328       | 335     | 8              | Pass cost. Units (LO) |
| 336       | 342     | 7              | Pass cost. Fractional |

#### SL - Season limited
| Start bit | End bit | Length in bits |       Purpose       |
|:---------:|:-------:|:--------------:|:-------------------:|
| 320       | 326     | 7              | Trips quantity (HI) |
| 328       | 335     | 8              | Trips quantity (LO) |

#### LT - Limited trip
| Start bit | End bit | Length in bits |                   Purpose                  |
|:---------:|:-------:|:--------------:|:------------------------------------------:|
| 152       | 167     | 16             | Expire date (Next period)                  |
| 168       | 175     | 8              | Trips quantity (Next period, HI)           |
| 176       | 182     | 7              | Trips quantity (Next period, LO)           |
| 320       | 326     | 7              | Trips quantity (HI)                        |
| 328       | 335     | 8              | Trips quantity (LO)                        |
| 132       | 132     | 1              | `ltpCntTripsPurchasedInCurrentPeriod` (HI) |
| 336       | 342     | 7              | `ltpCntTripsPurchasedInCurrentPeriod` (LO) |

#### OL - Omsk limited
| Start bit | End bit | Length in bits |             Purpose            |
|:---------:|:-------:|:--------------:|:------------------------------:|
| 320       | 326     | 7              | Trips quanitity (HI)           |
| 328       | 335     | 8              | Trips quanitity (LO)           |
| 328       | 331     | 4              | Trips quanitity (Suburban, LO) |
| 336       | 342     | 7              | Trips quanitity (Suburban, HI) |


## Acknowledgements
- [Metrodroid](https://github.com/metrodroid/metrodroid) contributors (especially [Vladimir Serbinenko](https://github.com/phcoder))
- [Deevilleto](https://habr.com/ru/users/Deevilleto/) for helping with reverse engineering 