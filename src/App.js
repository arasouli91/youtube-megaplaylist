import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.css';

import {
  VideoDetail,
  Playlist
} from './components';


const App = () => {


  return (
    <Router>
      <Box
        className='root'
        sx={{
          p: 1
        }}
      >
        <Switch>
          <Route exact path='/' component={Playlist} />
          <Route path='/video/:id' component={VideoDetail} />
        </Switch>
      </Box>
    </Router>
  );
}

export default App;