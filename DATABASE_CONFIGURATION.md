# Database-managed registration and payment options

The backend creates and seeds these tables at startup. Seed queries use
`INSERT IGNORE`, so a restart never overwrites manual database changes.

## Countries shown on Registration

`registration_countries` controls the Country dropdown. `iso2` is required so
the existing state/city lookup can work. Set `isDomestic` to `1` only for
countries allowed to make an online INR payment.

```sql
INSERT INTO registration_countries (name, iso2, isDomestic, isActive, displayOrder)
VALUES ('United States', 'US', 0, 1, 2);

UPDATE registration_countries
SET name = 'United Kingdom', iso2 = 'GB', displayOrder = 3
WHERE name = 'United States';

UPDATE registration_countries SET isActive = 0 WHERE name = 'United Kingdom';
```

## Author types shown on Registration

`author_types` controls the Author Type dropdown. The `code` is stored in the
registration, so do not change it after submissions exist; change `label`
instead.

```sql
INSERT INTO author_types (code, label, isActive, displayOrder)
VALUES ('research_scholar', 'Research Scholar', 1, 5);

UPDATE author_types SET label = 'Industry Professional' WHERE code = 'industry';
```

## Payment amounts

`payment_rates` controls the server-calculated amount. Amounts are in the
smallest currency unit: paise for INR and cents for USD. For example,
`850000` is INR 8,500 and `9500` is USD 95. The additional amounts apply to
each extra offline participant.

```sql
UPDATE payment_rates
SET domesticBaseAmount = 850000,
    internationalBaseAmount = 9500,
    domesticAdditionalAmount = 160000,
    internationalAdditionalAmount = 2500
WHERE authorTypeCode = 'ug_student';

INSERT INTO payment_rates
  (authorTypeCode, domesticBaseAmount, internationalBaseAmount,
   domesticAdditionalAmount, internationalAdditionalAmount)
VALUES ('research_scholar', 850000, 9500, 160000, 2500);
```

Existing per-paper overrides remain in `paper_payment_amounts`; those overrides
take priority over `payment_rates` for that particular paper.
