# City Restriction Management

## Overview

HoardNest operates exclusively within **Silay City, Negros Occidental, Philippines**. All delivery addresses, user registrations, and marketplace listings are restricted to this city. This skill covers city validation, barangay management, and address handling.

## Configuration

### Environment Variables

```bash
REACT_APP_ALLOWED_CITY="Silay City"
REACT_APP_DEFAULT_CITY="Silay City"
REACT_APP_DELIVERY_CITY="Silay City"
REACT_APP_SERVICE_RADIUS_KM="5"
REACT_APP_ENABLE_ADDRESS_VALIDATION="true"
```

### Config Access

```typescript
import config from "../config/environment";

config.business.defaultCity; // "Silay City"
config.delivery.city; // "Silay City"
config.business.serviceRadiusKm; // 5
```

## Key Files

| File                                | Purpose                                             |
| ----------------------------------- | --------------------------------------------------- |
| `.env`                              | City environment variables (single config file)     |
| `src/config/environment.ts`         | Centralized config with HoardNestConfig interface   |
| `src/pages/SignupPage.tsx`          | Registration with city display + barangay selection |
| `src/dashboard/DeliveryAddress.tsx` | Delivery address management                         |
| `backend/prisma/schema.prisma`      | DeliveryAddress model with city field               |

## Commands

### Validate an address against city restriction

```
/city-restriction validate <address>
```

### List all barangays

```
/city-restriction list-barangays
```

### Update allowed city

```
/city-restriction set-city <city_name>
```

## Silay City Barangays (17)

| #   | Barangay                 | #   | Barangay    |
| --- | ------------------------ | --- | ----------- |
| 1   | Bagtic                   | 10  | Guinhalaran |
| 2   | Balaring                 | 11  | Hawaiian    |
| 3   | Barangay I (Poblacion)   | 12  | Lantad      |
| 4   | Barangay II (Poblacion)  | 13  | Mambulac    |
| 5   | Barangay III (Poblacion) | 14  | Patag       |
| 6   | Barangay IV (Poblacion)  | 15  | Rizal       |
| 7   | Barangay V (Poblacion)   | 16  | E. Lopez    |
| 8   | Eustaquio Lopez          | 17  | —           |
| 9   | Guimbala-on              |     |             |

## Validation Rules

1. **Signup**: City field is read-only, pre-filled with `REACT_APP_ALLOWED_CITY`
2. **Delivery Address**: City must match `config.delivery.city`
3. **Item Listings**: Seller location must be within service radius
4. **Barangay**: Required field on signup and delivery address forms
5. **Street Address**: Required field for precise delivery instructions

## Address Format

```
<Street Address>, <Barangay>, Silay City, Negros Occidental
```

Example:

```
123 Rizal Street, Barangay I (Poblacion), Silay City, Negros Occidental
```

## Implementation Notes

- City field on SignupPage is displayed as a read-only TextField
- Barangay is a selectable dropdown populated from the barangay list
- The `REACT_APP_ALLOWED_CITY` env var controls the restriction
- Backend should validate city on address creation/update endpoints
- Future: GPS-based validation within service radius
