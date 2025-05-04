import { accessModuleResponse } from './AccessModule';

export interface roleResponse {
  id?: string;
  title: string;
  accessModules: accessModuleResponse[];
}

export interface roleRequest {
  title: string;
}
