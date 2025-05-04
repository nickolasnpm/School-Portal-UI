import { roleResponse } from './Role';

export interface accessModuleResponse {
  id: string;
  name: string;
  roles?: roleResponse[];
}

export interface accessModuleRequest {
  name: string;
  roleIds: string[];
}
