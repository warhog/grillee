
## data
### Probe performance data

Values based on 47k measurement resistor.
![Sensor performance chart](data_resolution.png)

Property | Symbol | Value
-------- | -------- | --------
Resistance at 0°C | R<sub>0</sub> | 152.03k
Resistance at 25°C | R<sub>25</sub> | 48.29k
Resistance at 85°C | R<sub>85</sub> | 5.31k
Beta 25°C to 85°C | B<sub>25/85</sub>| 3930K
Minimum measurable temperature | | -70.1°C
Minimum high-res temperature | | -35.8°C
Highest resolution || 2.26e-02°C/step at 19.8°C
Maximum high-res temperature | | 90.5°C
Maximum measurable temperature | | 220.8°C

### Probe curve data
![Probe fit chart](data_curve.png)

Property | Symbol | Value
-------- | -------- | --------
Resistance near 25°C | R<sub>25</sub><sup>1</sup> | 50.00k
Steinhart-Hart coefficient | a | 3.3648668e-03 ± 1.9524753e-06
Steinhart-Hart coefficient | b | 2.6369913e-04 ± 3.0236389e-06
Steinhart-Hart coefficient | c | 3.9587022e-06 ± 1.1627420e-06

<sup>1</sup>: The deviation between this R<sub>25</sub> and the R<sub>25</sub> shown above is not relevant, this R<sub>25</sub> is taken from the original data point which is closest to 25°C. The value taken as a factor into the calculation of the final value and serves only a scaling purpose to the Steinhart-Hart coefficients.
