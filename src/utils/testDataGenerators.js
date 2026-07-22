const letters = "abcdefghijklmnopqrstuvwxyz";
const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numbers = "0123456789";
const symbols = "!@#$%^&*()_+-=[]{};:,.?";

function randomFrom(value) {
  return value[Math.floor(Math.random() * value.length)];
}

function randomString(length, characters) {
  return Array.from(
    { length },
    () => randomFrom(characters)
  ).join("");
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDecimal(min, max) {
  return Number(
    (Math.random() * (max - min) + min).toFixed(2)
  );
}

function randomName() {
  const firstNames = [
    "Ahmed",
    "Youssef",
    "Omar",
    "Mohamed",
    "Ali",
    "Sara",
    "Mariam",
    "Nour",
    "Salma",
    "Laila",
    "Adam",
    "Daniel",
    "Emma",
    "Sophia",
  ];

  const lastNames = [
    "Hassan",
    "Ibrahim",
    "Mahmoud",
    "Khalil",
    "Saleh",
    "Morgan",
    "Smith",
    "Johnson",
    "Brown",
  ];

  return {
    first: firstNames[randomNumber(0, firstNames.length - 1)],
    last: lastNames[randomNumber(0, lastNames.length - 1)],
  };
}

function generateEmail(valid = true) {
  const name = randomString(
    randomNumber(5, 10),
    letters + numbers
  );

  if (valid) {
    const domains = [
      "example.com",
      "test.com",
      "qa.local",
      "example.org",
    ];

    return `${name}@${domains[randomNumber(0, domains.length - 1)]}`;
  }

  const invalidPatterns = [
    `${name}@`,
    `@example.com`,
    `${name}example.com`,
    `${name}@example`,
    `${name}@@example.com`,
    `${name} @example.com`,
  ];

  return invalidPatterns[
    randomNumber(0, invalidPatterns.length - 1)
  ];
}

function generatePassword(options) {
  const {
    length = 16,
    uppercaseEnabled = true,
    lowercaseEnabled = true,
    numbersEnabled = true,
    symbolsEnabled = true,
  } = options;

  let charset = "";

  if (uppercaseEnabled) charset += uppercase;
  if (lowercaseEnabled) charset += letters;
  if (numbersEnabled) charset += numbers;
  if (symbolsEnabled) charset += symbols;

  if (!charset) charset = letters;

  const required = [];

  if (uppercaseEnabled) required.push(randomFrom(uppercase));
  if (lowercaseEnabled) required.push(randomFrom(letters));
  if (numbersEnabled) required.push(randomFrom(numbers));
  if (symbolsEnabled) required.push(randomFrom(symbols));

  while (required.length < length) {
    required.push(randomFrom(charset));
  }

  return required
    .slice(0, length)
    .sort(() => Math.random() - 0.5)
    .join("");
}

function generatePhone() {
  const prefixes = ["010", "011", "012", "015"];

  return `${randomFrom(prefixes)}${randomString(
    8,
    numbers
  )}`;
}

function generateUsername(length = 10) {
  return randomString(
    length,
    letters + uppercase + numbers + "._"
  );
}

function generateUuid() {
  if (crypto?.randomUUID) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (char) => {
      const random = Math.floor(Math.random() * 16);
      const value =
        char === "x" ? random : (random & 0x3) | 0x8;

      return value.toString(16);
    }
  );
}

function generateIpv4() {
  return Array.from(
    { length: 4 },
    () => randomNumber(0, 255)
  ).join(".");
}

function generateUrl(valid = true) {
  const slug = randomString(8, letters + numbers);

  if (valid) {
    return `https://example.com/${slug}`;
  }

  const invalid = [
    `example.${slug}`,
    `https//example.com/${slug}`,
    `://example.com/${slug}`,
    `https://${slug}`,
  ];

  return randomFrom(invalid);
}

function generateDate(mode = "future") {
  const now = Date.now();
  const day = 86400000;

  const offset = randomNumber(1, 365) * day;

  const date =
    mode === "past"
      ? new Date(now - offset)
      : new Date(now + offset);

  return date.toISOString();
}

export const edgeCasePresets = [
  {
    value: "",
    type: "Empty",
    validity: "Invalid",
  },
  {
    value: " ",
    type: "Whitespace",
    validity: "Invalid",
  },
  {
    value: "     ",
    type: "Multiple Spaces",
    validity: "Invalid",
  },
  {
    value: "أحمد يوسف",
    type: "Arabic / Unicode",
    validity: "Depends on requirement",
  },
  {
    value: "测试数据",
    type: "Unicode",
    validity: "Depends on requirement",
  },
  {
    value: "😀🔥🚀",
    type: "Emoji",
    validity: "Depends on requirement",
  },
  {
    value: "<div>test</div>",
    type: "HTML-like Input",
    validity: "Depends on requirement",
  },
  {
    value: "'quoted value'",
    type: "Quoted Text",
    validity: "Depends on requirement",
  },
  {
    value: "test\nnew line",
    type: "Multiline",
    validity: "Depends on requirement",
  },
  {
    value: randomString(1000, letters),
    type: "Very Long Text",
    validity: "Depends on requirement",
  },
];

export function generateBoundaryData({
  dataType,
  min,
  max,
}) {
  const minValue = Number(min);
  const maxValue = Number(max);

  if (
    !Number.isFinite(minValue) ||
    !Number.isFinite(maxValue)
  ) {
    return [];
  }

  if (dataType === "number") {
    return [
      {
        value: minValue - 1,
        type: "Min - 1",
        validity: "Invalid",
      },
      {
        value: minValue,
        type: "Min",
        validity: "Valid",
      },
      {
        value: minValue + 1,
        type: "Min + 1",
        validity: "Valid",
      },
      {
        value: maxValue - 1,
        type: "Max - 1",
        validity: "Valid",
      },
      {
        value: maxValue,
        type: "Max",
        validity: "Valid",
      },
      {
        value: maxValue + 1,
        type: "Max + 1",
        validity: "Invalid",
      },
    ];
  }

  if (dataType === "text") {
    const make = (length) =>
      randomString(Math.max(0, length), letters);

    return [
      {
        value: make(minValue - 1),
        type: `Length ${Math.max(0, minValue - 1)}`,
        validity: "Invalid",
      },
      {
        value: make(minValue),
        type: `Length ${minValue}`,
        validity: "Valid",
      },
      {
        value: make(minValue + 1),
        type: `Length ${minValue + 1}`,
        validity: "Valid",
      },
      {
        value: make(maxValue - 1),
        type: `Length ${maxValue - 1}`,
        validity: "Valid",
      },
      {
        value: make(maxValue),
        type: `Length ${maxValue}`,
        validity: "Valid",
      },
      {
        value: make(maxValue + 1),
        type: `Length ${maxValue + 1}`,
        validity: "Invalid",
      },
    ];
  }

  return [];
}

export function generateTestData({
  type,
  count = 10,
  length = 12,
  min = 0,
  max = 100,
  mode = "valid",
  uppercaseEnabled = true,
  lowercaseEnabled = true,
  numbersEnabled = true,
  symbolsEnabled = true,
  customCharacters = "",
}) {
  const results = [];

  for (let index = 0; index < count; index += 1) {
    let value = "";
    let validity = "Valid";

    switch (type) {
      case "number":
        value = randomNumber(Number(min), Number(max));
        break;

      case "decimal":
        value = randomDecimal(Number(min), Number(max));
        break;

      case "letters":
        value = randomString(Number(length), letters);
        break;

      case "uppercase":
        value = randomString(Number(length), uppercase);
        break;

      case "alphanumeric":
        value = randomString(
          Number(length),
          letters + uppercase + numbers
        );
        break;

      case "name": {
        const name = randomName();
        value = `${name.first} ${name.last}`;
        break;
      }

      case "firstname":
        value = randomName().first;
        break;

      case "lastname":
        value = randomName().last;
        break;

      case "email": {
        const valid =
          mode === "mixed"
            ? Math.random() > 0.5
            : mode === "valid";

        value = generateEmail(valid);
        validity = valid ? "Valid" : "Invalid";
        break;
      }

      case "password":
        value = generatePassword({
          length: Number(length),
          uppercaseEnabled,
          lowercaseEnabled,
          numbersEnabled,
          symbolsEnabled,
        });
        break;

      case "phone":
        value = generatePhone();
        break;

      case "username":
        value = generateUsername(Number(length));
        break;

      case "uuid":
        value = generateUuid();
        break;

      case "ipv4":
        value = generateIpv4();
        break;

      case "url": {
        const valid =
          mode === "mixed"
            ? Math.random() > 0.5
            : mode === "valid";

        value = generateUrl(valid);
        validity = valid ? "Valid" : "Invalid";
        break;
      }

      case "date":
        value = generateDate(mode);
        break;

      case "symbols":
        value = randomString(Number(length), symbols);
        break;

      case "boolean":
        value = Math.random() > 0.5 ? "true" : "false";
        break;

      case "custom":
        value = randomString(
          Number(length),
          customCharacters || letters
        );
        break;

      default:
        value = randomString(Number(length), letters);
    }

    results.push({
      id: index + 1,
      value: String(value),
      type,
      validity,
    });
  }

  return results;
}