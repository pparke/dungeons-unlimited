/**
   Name Gen
   Name generator.
 */

class NameGen {
  constructor () {
    this.consonants   = 'bcdfghjklmnpqrstvwxz';
    this.vowels       = 'aeiouy';
    this.double       = 'bdeoglmnprst';
    this.doubleFreq   = 0.1;
    this.compoundCon  = [ 'ch', 'ck', 'gh', 'ng', 'ph', 'qu', 'sc', 'sh', 'th', 'wh', 'bt', 'pt', 'kn', 'gn', 'pn', 'mb', 'lm', 'ps', 'rh', 'wr' ];
    this.compConFreq  = 0.1;
    this.compoundVow   = [ 'io', 'ie', 'ia', 'ua', 'eu', 'ae', 'ea', 'oy', 'yo', 'eo', 'oe', 'oa' ];
    this.compVowFreq  = 0.1;
    this.gender       = 'male';
    this.length       = 2;
    this.random       = new Phaser.RandomDataGenerator([ '374847367262647' ]);
    this.random.sow(new Array(20).fill((Math.random()*100000) + 100));
  }

  male () {
    this.gender = 'male';
    return this;
  }

  female () {
    this.gender = 'female';
    return this;
  }

  short () {
    this.length = this.random.between(3, 5);
    return this;
  }

  medium () {
    this.length = this.random.between(5, 10);
    return this;
  }

  long () {
    this.length = this.random.between(10, 15);
    return this;
  }

  generate () {
    let name = new Array(this.length).fill(' ');
    // initial name generation
    name = name.reduce((hist, char, i) => {
      // special case for beginning or end
      if (i === 0 || i === this.length-1) {
        switch (this.gender) {
        case 'male':
          if (i > 0 && this.isConsonant(hist[i-1])) {
            hist.push(this.getRandomVow());
          }
          hist.push(this.getRandomCon());
          break;
        case 'female':
          hist.push(this.getRandomVow());
          break;
        default:
          hist.push(this.getRandomChar());
          break;
        }
      }
      else {
        hist.push(this.getNextChar(hist[i-1]));
      }

      return hist;
    }, []);

    name[0] = name[0].toUpperCase();
    name = name.join('');

    console.log(name);
    return name;
  }

  isConsonant (char) {
    if (char.length > 1) {
      char = char.charAt[char.length-1];
    }
    return this.consonants.indexOf(char) > -1;
  }

  isVowel (char) {
    if (char.length > 1) {
      char = char.charAt[char.length-1];
    }
    return this.vowels.indexOf(char) > -1;
  }

  getNextChar (prevChar) {
    if (prevChar.length > 1) {
      prevChar = prevChar.charAt[prevChar.length-1];
    }
    let charFn;
    // if the previous charcter was a vowel
    if (this.vowels.indexOf(prevChar) > -1) {
      if (Math.random() < this.compConFreq) {
        charFn = this.getRandomCompCon;
      }
      else {
        charFn = this.getRandomCon;
      }
    }
    else {
      if (Math.random() < this.compVowFreq) {
        charFn = this.getRandomCompVow;
      }
      else {
        charFn = this.getRandomVow;
      }
    }
    // occasionally double the character if it is doublable
    if (this.double.indexOf(prevChar) > -1 && Math.random() < this.doubleFreq) {
      return prevChar;
    }

    let char = charFn.call(this);
    console.log('char is:', char);
    return char;
  }

  getRandomCon () {
    return this.consonants.charAt(this.random.between(0, this.consonants.length-1));
  }

  getRandomCompCon () {
    return this.compoundCon[this.random.between(0, this.compoundCon.length-1)];
  }

  getRandomVow () {
    return this.vowels.charAt(this.random.between(0, this.vowels.length-1));;
  }

  getRandomCompVow () {
    return this.compoundVow[this.random.between(0, this.compoundVow.length-1)];
  }

  getRandomChar () {
    let alpha = this.consonants + this.vowels;
    return alpha.charAt(this.random.between(0, alpha.length-1));
  }
}

export default NameGen;
