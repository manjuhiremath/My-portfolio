async function test() {
  try {
    const response = await fetch('https://unsplash.com/s/photos/machine-learning');
    const text = await response.text();
    const matches = text.match(/https:\/\/images\.unsplash\.com\/photo-[^?"]+/g);
    if (!matches) {
        console.log("No matches found");
        return;
    }
    console.log(JSON.stringify([...new Set(matches)].slice(0, 5), null, 2));
  } catch (err) {
    console.error(err);
  }
}

test();
