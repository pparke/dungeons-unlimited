/**
   Name Gen
   Name generator.
 */

class NameGen {
  constructor () {
    this.consonants = 'bcdfghjklmnpqrstvwxz';
    this.vowels = 'aeiouy';
    this.double = 'bdeglmnprst';
    this.gender = 'male';
    this.length = 2;
    this.random = new Phaser.RandomDataGenerator(["374847367262647"]);
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
    this.length = this.random.between(2, 5);
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
    name = name.reduce((hist, char, i) => {
      // special case for beginning or end
      if (i === 0 || i === this.length-1) {
        switch (this.gender) {
          case 'male':
            hist.push(this.getRandomCon());
          case 'female':
            hist.push(this.getRandomVow());
          default:
            hist.push(this.getRandomChar());
        }
      }
      else {
        // if the previous charcter was a vowel
        if (this.vowels.indexOf(hist[i-1]) > -1) {
          console.log('prev is vowel')
          hist.push(this.getRandomCon());
        }
        else {
          console.log('prev is consonant')
          hist.push(this.getRandomVow());
        }
      }

      return hist;
    }, []);

    name[0] = name[0].toUpperCase();
    name = name.join('');

    return name;
  }

  getRandomCon () {
    return this.consonants.charAt(this.random.between(0, this.consonants.length-1));
  }

  getRandomVow () {
    return this.vowels.charAt(this.random.between(0, this.vowels.length-1));
  }

  getRandomChar () {
    let alpha = this.consonants + this.vowels;
    return alpha.charAt(this.random.between(0, alpha.length-1));
  }
}

export default NameGen;
