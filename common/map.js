import _ from 'lodash';
import { makeTile, TREE, ROCK, AQUA, NONE} from './tiles';

function generate(width, height) {
  const possibleTypes = [TREE, ROCK, AQUA, NONE];
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      makeTile(j, i, _.sample(possibleTypes));
    }
  }
}

export default generate;
