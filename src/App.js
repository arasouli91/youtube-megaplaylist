import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.css';

import {
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
          <Route exact path='/xxx' component={Playlist} />
          <Route exact path='/' component={Playlist} disableMetrics={true} />
        </Switch>
      </Box>
    </Router>
  );
}

export default App;