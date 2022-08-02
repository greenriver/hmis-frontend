# Form definitions

Form definitions loosely based on FHIR Questionnaire specification.

#### Generating answerOptions

Script to generate answer options for `prior` living situations

```
puts ["homeless_situations", "institutional_situations", "temporary_and_permanent_housing_situations", "other_situations"].map { |group| HUD.send(group, as: :prior).map { |id| { valueCoding: { code: id.to_s, display: HUD.available_situations[id], displayGroup: group.humanize } } } }.flatten(1).to_json
```

Generate enableWhen for living situation

```
JSON.stringify([15, 6, 7, 25, 4, 5, 29, 14, 2, 32, 36, 35, 28, 19, 3, 31, 33, 34, 10, 20, 21, 11].map((i) => { return {question: "prior-living",operator: "=",answerCoding: { code: i.toString() } }}))
```
