let fs = require('fs');

class BufferedReader {
  constructor() {
    global.readline = () => {
      try {
        return this.nextLine();
      } catch (e) {
        return null;
      }
    };

    global.nextInt = () => {
      try {
        return this.nextInt();
      } catch (e) {
        return null;
      }
    };

    global.nextNumber = () => {
      try {
        return this.nextNumber();
      } catch (e) {
        return null;
      }
    };

    global.print = (x) => {
      console.log(x);
    };
  }

  buf = Buffer.alloc(1 << 14);
  bufPos = 0;
  bufLen = 0;
  ensure() {
    if (this.bufPos === this.bufLen) {
      this.bufPos = 0;
      this.bufLen = fs.readSync(0, this.buf, 0, this.buf.length, null);
    }
  }
  isws(ch) {
    return ch === 32 || ch === 9 || ch === 10 || ch === 13;
  }
  islf(ch) {
    return ch === 10 || ch === 13;
  }
  peekChar() {
    this.ensure();
    return this.bufPos === this.bufLen ? 0 : this.buf[this.bufPos];
  }
  skipWs() {
    while (this.isws(this.peekChar())) this.bufPos++;
  }

  readUntil(stop) {
    this.ensure();
    if (this.bufPos === this.bufLen) throw new Error('eof');
    let start = this.bufPos;
    let before = null;
    for (;;) {
      if (this.bufPos === this.bufLen) {
        // Hit the end; need to switch buffers. Thus, stash away all we have so far
        // into the 'before' buffer.
        let len = this.bufPos - start,
          preLen = before ? before.length : 0;
        let nbuf = Buffer.alloc(len + preLen);
        if (before) before.copy(nbuf);
        before = nbuf;
        this.buf.copy(before, preLen, start);
        this.ensure();
        start = this.bufPos;
      }
      if (this.bufPos === this.bufLen || stop(this.buf[this.bufPos])) break;
      this.bufPos++;
    }
    if (!before) return this.buf.toString('utf8', start, this.bufPos);
    let after = this.buf.slice(start, this.bufPos);
    let res = Buffer.alloc(before.length + after.length);
    before.copy(res);
    after.copy(res, before.length);
    return res.toString();
  }

  nextToken() {
    this.skipWs();
    return this.readUntil(this.isws);
  }

  nextLine() {
    let line = this.readUntil(this.islf);
    if (this.peekChar() === 13) this.bufPos++;
    if (this.peekChar() === 10) this.bufPos++;
    return line;
  }

  nextNumber() {
    return +this.nextToken();
  }

  nextInt() {
    return this.nextToken() | 0;
  }
}

new BufferedReader();

main();

/*=====================START HERE=====================*/

function main() {
  let line = readline();
  let integer = nextInt();
}
