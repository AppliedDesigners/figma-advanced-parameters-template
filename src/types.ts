/**
 * Functionality
 * - sort by time
 * - distance between times
 * - distance from
 */
export interface IAdjustDateParams extends ParameterValues {
    operator: string;
    amount: string;
    format: string;
}
  
export interface IFakeParams extends ParameterValues {
    entity: string;
}