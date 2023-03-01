export class VectorCriteriaConvolution {
  constructor(matrix, coeffs, interval) {
    this.matrix = this.#normalize(matrix, interval);
    this.coeffs = this.#normalizeCoeffs(coeffs);
  }

  solve() {
    let res = this.matrix[0].slice(1).map((x) => [x, [], []]);

    for (let i = 1; i < this.matrix[0].length; i++) {
      for (let j = 1; j < this.matrix.length; j++) {
        if (res[j - 1]) {
          res[j - 1][1].push(this.matrix[j][i]);
          res[j - 1][2].push(this.matrix[j][i] * this.coeffs[j - 1]);
        }
      }
    }

    res = res
      .map((x) => {
        x[1] = x[1].reduce((s, n) => s + n);
        x[2] = x[2].reduce((s, n) => s + n);
        return x;
      })
      .map((x) => {
        x[1] = this.#roundTo(x[1], 3);
        x[2] = this.#roundTo(x[2], 3);
        return x;
      });

    res.unshift(["Альтернативи:", "Без вагомості:", "З вагомістю:"]);

    this.#printMatrix("Значення узагальнених критеріїв", res);
  }

  #normalize(matrix, interval) {
    const res = matrix;

    for (let i = 1; i < res.length; i++) {
      let values = res[i].slice(1); // criteria values

      for (let j = 1; j < res[i].length; j++) {
        res[i][j] = this.#normalizeCriteria(res[i][j], values, interval);
      }
    }

    this.#printMatrix("Нормалізовані оцінки критеріїв:", res);
    return res;
  }

  #normalizeCoeffs(W) {
    const sum = W.reduce((s, r) => s + r[1], 0);

    const res = W.map((row) => {
      row[1] = this.#roundTo(row[1] / sum, 2);
      return row;
    });

    this.#printMatrix("Нормалізовані коєфіцієнти:", res);
    return res.map((row) => row[1]);
  }

  #normalizeCriteria(F, values, [a, b]) {
    const Fmin = Math.min(...values);
    const Fmax = Math.max(...values);

    return this.#roundTo(((F - Fmin) / (Fmax - Fmin)) * (b - a) + a, 3);
  }

  #printMatrix(title = "", matrix) {
    console.log(title);
    console.table(matrix);
    console.log("");
  }

  #roundTo(num, place) {
    return +(Math.round(num + "e+" + place) + "e-" + place);
  }
}
