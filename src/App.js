import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Box } from '@mui/material';

import {
  VideoDetail,
  Navbar,
  Playlist
} from './components';

const App = () => (
  <Router>
    <Box
      className='root'
      sx={{
        p: 1
      }}
    >
      <Navbar />
      <Switch>
        <Route exact path='/' component={Playlist} />
        <Route path='/video/:id' component={VideoDetail} />
      </Switch>
    </Box>
  </Router>
);

export default App;
