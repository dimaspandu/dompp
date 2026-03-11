# DOMPP Preprint Final Template (Section-by-Section)

Use this file as the writing template for the final manuscript before submission.

## First Page Block

- Title:
- Authors:
- Affiliations:
- Corresponding author (name, email, address):
- Abstract:
- Keywords:

## 1. Introduction

- Problem statement:
- Research gap:
- Research objective:
- Contributions (3-5 bullets):

## 2. Background and Related Work

### 2.1 DOM semantics baseline

### 2.2 Imperative vs declarative update models

### 2.3 Incremental/reactive computation foundations

### 2.4 Program comprehension and auditability

## 3. DOMPP Conceptual Model

### 3.1 Design goals

### 3.2 Non-goals

### 3.3 API primitives and invariants

## 4. Research Questions

- RQ1:
- RQ2:
- RQ3:

## 5. Methodology

### 5.1 Prototype context

### 5.2 Demonstration scenarios

### 5.3 DOM operation instrumentation

### 5.4 Complexity model and assumptions

## 6. Results

### 6.1 API to operation mapping table

| Primitive | Operation class | Time | Space | Notes |
|---|---|---|---|---|
| | | | | |

### 6.2 Complexity summary table

| Scenario | Time | Space | Identity |
|---|---|---|---|
| | | | |

### 6.3 DOM operation count table

| Scenario | text_set | attr_set | child_insert | child_remove | child_move | event_add | event_remove |
|---|---:|---:|---:|---:|---:|---:|---:|
| | | | | | | | |

### 6.4 Figures

- Figure 1: Architecture/update-flow diagram
- Figure 2: Operation-count comparison chart
- Figure 3 (optional): Identity-preservation matrix

## 7. Discussion

- Interpretation of results:
- Scope boundary of claims:
- Practical implications:

## 8. Threats to Validity

- Internal validity:
- External validity:
- Construct validity:

## 9. Conclusion

- Main findings:
- Limitations:
- Future work:

## 10. Declarations

### Funding

### Conflicts of Interest

### Data Availability Statement

### Ethics Statement (if applicable)

### AI Use Disclosure (if applicable)

### Acknowledgments

## 11. References

- Ensure every citation maps to `references.bib`.

## 12. Conversion Notes

```powershell
pandoc docs/preprints/FINAL_SECTION_TEMPLATE.md -o docs/preprints/DOMPP_Preprint_Draft.docx
pandoc docs/preprints/FINAL_SECTION_TEMPLATE.md -o docs/preprints/DOMPP_Preprint_Draft.pdf
```
