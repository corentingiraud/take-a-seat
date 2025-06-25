import ejs from 'ejs';
import path from 'path';
import fs from 'fs';

export const renderEJSTemplate = async (templateName: string, data: object) => {
  const templatePath = path.resolve(__dirname, `../../../emails/${templateName}`);
  const template = fs.readFileSync(templatePath, 'utf8');
  return ejs.render(template, data);
}
