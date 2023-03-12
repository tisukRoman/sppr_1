import * as consts from "./consts.js";

export class Promethee {
  constructor(matrix, functions, weights) {
    this.matrix = matrix;
    this.matrixFunctions = functions;
    this.weights = this.#normalizeCoeffs(weights);

    this.functions = {
      [consts.USUAL_CRITERION]: function (d) {
        return d <= 0 ? 0 : 1;
      },
      [consts.U_SHAPE]: function (d, q) {
        return d <= q ? 0 : 1;
      },
      [consts.V_SHAPE_NOT_INDIFFERENCE]: function (d, p) {
        if (d <= 0) return 0;
        else if (0 < d && d <= p) return d / p;
        else return 1;
      },
      [consts.LEVEL_CRITERION]: function (d, q, p) {
        if (d <= q) return 0;
        else if (q < d && d <= p) return 1 / 2;
        else return 1;
      },
      [consts.V_SHAPE_INDIFFERENCE]: function (d, q, p) {
        if (d <= q) return 0;
        else if (q < d && d <= p) return (d - p) / (d - q);
        else 1;
      },
      [consts.GAUSSIAN_CRITERION]: function (d, s) {
        if (d <= 0) return 0;
        else return 1 - Math.exp(d ** 2 / (2 * s ** 2));
      },
    };
  }

  solve() {
    const diffMatrices = this.#getCriterionDifferenceMatrices();
    const multiCriterionIndexes = this.#getMulticriterionIndexes(diffMatrices);

    this.#printMatrix(
      "ІНДЕКСИ БАГАТОКРИТЕРІАЛЬНОЇ ПЕРЕВАГИ",
      multiCriterionIndexes
    );

    const positiveStream = this.#getPositiveStreams(multiCriterionIndexes);
    const negativeStream = this.#getNegativeStreams(multiCriterionIndexes);

    this.#printMatrix("Позитивний потік", positiveStream);
    this.#printMatrix("Негативний потік", negativeStream);

    const rangedAlternatives = this.#rangeAlternatives(
      positiveStream,
      negativeStream
    );

    this.#printMatrix("Відрaнжована матриця", rangedAlternatives);
    console.log(`Отже, найкраща альтернатива - ${rangedAlternatives[1][0]}`);
  }

  #getCriterionDifferenceMatrices() {
    const n = this.matrix.length;
    const res = [];

    for (let i = 1; i < n; i++) {
      let [_, functionType, ...params] = this.matrixFunctions[i];
      let [title, ...values] = this.matrix[i];

      const criterionWeights = this.#getCriterionDifferenceWeights(
        functionType,
        params,
        values
      );

      res.push(criterionWeights);

      this.#printMatrix(
        `ЗНАЧЕННЯ ФУНКЦІЇ ПЕРЕВАГИ КРИТЕРІЮ "${title}" (функція - ${functionType})`,
        criterionWeights
      );
    }

    return res;
  }

  #getMulticriterionIndexes(diffMatrices) {
    return diffMatrices.reduce((prev, x, k) => {
      const acc = prev;
      for (let i = 0; i < diffMatrices[0].length; i++) {
        for (let j = 0; j < diffMatrices[0].length; j++) {
          acc[i][j] = this.#roundTo(
            (prev[i][j] + x[i][j]) * this.weights[k],
            4
          );
        }
      }
      return acc;
    });
  }

  #getCriterionDifferenceWeights(functionType, params, values) {
    return values.map((_, i) => {
      return values.map((_, j) => {
        const functionValue = this.functions[functionType](
          values[i] - values[j],
          ...params
        );
        return this.#roundTo(functionValue, 4);
      });
    });
  }

  #getPositiveStreams(indexes) {
    return indexes.map((row) => {
      return this.#roundTo((1 / row.length) * row.reduce((s, x) => s + x), 4);
    });
  }

  #getNegativeStreams(indexes) {
    return indexes.map((_, i) => {
      return this.#roundTo(
        (1 / _.length) *
          _.reduce((acc, _, j) => {
            return acc + indexes[j][i];
          }, 0),
        4
      );
    });
  }

  #rangeAlternatives(positive, negative) {
    const res = positive
      .map((_, i) => {
        const criterionTitle = this.matrix[0].slice(1)[i];
        const cleanStream = positive[i] - negative[i];
        return [criterionTitle, positive[i], negative[i], cleanStream];
      })
      .sort((a, b) => b[3] - a[3])
      .map((row, i) => [...row, i + 1]);

    res.unshift(["Альтернативи", "Ф+", "Ф-", "Ф", "Ранг"]);
    return res;
  }

  #normalizeCoeffs(W) {
    const sum = W.reduce((s, r) => s + r[1], 0);

    return W.map((row) => {
      row[1] = this.#roundTo(row[1] / sum, 2);
      return row;
    }).map((row) => row[1]);
  }

  #roundTo(num, place) {
    return +(Math.round(num + "e+" + place) + "e-" + place);
  }

  #printMatrix(title = "", matrix) {
    console.log(title);
    console.table(matrix);
    console.log("");
  }
}
