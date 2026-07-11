import app from './server';
import { config } from './config';

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[server]: Backend server is running at http://localhost:${config.port}`);
});
