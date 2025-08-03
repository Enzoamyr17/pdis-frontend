"use client"

import { ModuleData } from '@/contexts/ModuleContext'
import SuppliesRequisitionModule from './SuppliesRequisitionModule'
import VehicleRequisitionModule from './VehicleRequisitionModule'
import IMClearanceFormModule from './IMClearanceFormModule'
import GatePassModule from './GatePassModule'
import EquipmentRentalModule from './EquipmentRentalModule'
import FabricationRequestModule from './FabricationRequestModule'
import FlightBookingModule from './FlightBookingModule'
import JOMSModule from './JOMSModule'
import PurchaseRequestModule from './PurchaseRequestModule'
import BRCashAdvanceModule from './BRCashAdvanceModule'
import BRReimbursementModule from './BRReimbursementModule'
import OpexBudgetModule from './OpexBudgetModule'
import BulletinsAdvisoriesModule from './BulletinsAdvisoriesModule'
import PerformanceManagementModule from './PerformanceManagementModule'
import UserCreationModule from './UserCreationModule'
import ClientRegistrationModule from './ClientRegistrationModule'
import IndependentManpowerModule from './IndependentManpowerModule'
import CreationOfJOModule from './CreationOfJOModule'
import CreationOfPEPModule from './CreationOfPEPModule'
import BigCalendarModule from './BigCalendarModule'
import VendorManagementModule from './VendorManagementModule'
import GenOpsClientManagementModule from './GenOpsClientManagementModule'
import SystemReportsModule from './SystemReportsModule'
import PDDirectoryModule from './PDDirectoryModule'

// Generic placeholder component for modules not yet implemented
// Currently unused but kept for future module implementations

//eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
function GenericModuleComponent({ title, icon: Icon, description }: { title: string, icon: any, description: string }) {
  return (
    <div className="h-full p-6">
      <div className="flex items-center gap-3 mb-6">
        <Icon className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-semibold text-gray-700">{title}</h1>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-12">
          <Icon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-600 mb-2">{title}</h2>
          <p className="text-gray-500 mb-6">{description}</p>
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-blue-600 font-medium">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export const moduleRegistry: Record<string, ModuleData> = {
  // Service Center modules
  'supplies-requisition': {
    id: 'supplies-requisition',
    title: 'Supplies Requisition',
    component: SuppliesRequisitionModule
  },
  'vehicle-requisition': {
    id: 'vehicle-requisition',
    title: 'Vehicle Requisition',
    component: VehicleRequisitionModule
  },
  'im-clearance-form': {
    id: 'im-clearance-form',
    title: 'IM Clearance Form',
    component: IMClearanceFormModule
  },
  'gate-pass': {
    id: 'gate-pass',
    title: 'Gate Pass In / Gate Pass Out',
    component: GatePassModule
  },
  'equipment-rental': {
    id: 'equipment-rental',
    title: 'Equipment Rental',
    component: EquipmentRentalModule
  },
  'fabrication-request': {
    id: 'fabrication-request',
    title: 'Fabrication / Refurbishing Request',
    component: FabricationRequestModule
  },
  'flight-booking': {
    id: 'flight-booking',
    title: 'Flight Booking Requisition',
    component: FlightBookingModule
  },
  'joms': {
    id: 'joms',
    title: 'JO for Messengerial Service (JOMS)',
    component: JOMSModule
  },
  'purchase-request': {
    id: 'purchase-request',
    title: 'Purchase Request (with SAP Tracker)',
    component: PurchaseRequestModule
  },
  'br-cash-advance': {
    id: 'br-cash-advance',
    title: 'BR Cash Advance',
    component: BRCashAdvanceModule
  },
  'br-reimbursement': {
    id: 'br-reimbursement',
    title: 'BR Reimbursement',
    component: BRReimbursementModule
  },

  // GenAd Tools modules
  'opex-budget': {
    id: 'opex-budget',
    title: 'OPEX Budget (GenAd PEP)',
    component: OpexBudgetModule
  },
  'bulletins-advisories': {
    id: 'bulletins-advisories',
    title: 'Bulletins, Advisories, Policies',
    component: BulletinsAdvisoriesModule
  },
  'performance-management': {
    id: 'performance-management',
    title: 'Performance Management',
    component: PerformanceManagementModule
  },
  'user-creation': {
    id: 'user-creation',
    title: 'User Creation (Org Chart)',
    component: UserCreationModule
  },
  'client-registration': {
    id: 'client-registration',
    title: 'Client Registration',
    component: ClientRegistrationModule
  },
  'im-registration': {
    id: 'im-registration',
    title: 'Independent Manpower',
    component: IndependentManpowerModule
  },

  // GenAd Tools modules - new
  'vendor-management': {
    id: 'vendor-management',
    title: 'Vendor Management',
    component: VendorManagementModule
  },

  // GenOps Tools modules
  'genops-client-management': {
    id: 'genops-client-management',
    title: 'GenOps Client Management',
    component: GenOpsClientManagementModule
  },
  'creation-of-jo': {
    id: 'creation-of-jo',
    title: 'Creatives JO',
    component: CreationOfJOModule
  },
  'creation-of-pep': {
    id: 'creation-of-pep',
    title: 'GenOps PEP',
    component: CreationOfPEPModule
  },

  // Reports modules
  'system-reports': {
    id: 'system-reports',
    title: 'System Reports',
    component: SystemReportsModule
  },

  // PD Directory modules
  'pd-directory-client': {
    id: 'pd-directory-client',
    title: 'PD Directory - Client',
    component: PDDirectoryModule
  },
  'pd-directory-vendor': {
    id: 'pd-directory-vendor',
    title: 'PD Directory - Vendor',
    component: PDDirectoryModule
  },
  'pd-directory-user': {
    id: 'pd-directory-user',
    title: 'PD Directory - User',
    component: PDDirectoryModule
  },
  'pd-directory-im': {
    id: 'pd-directory-im',
    title: 'PD Directory - IM',
    component: PDDirectoryModule
  },

  // Additional Tools
  'big-calendar': {
    id: 'big-calendar',
    title: 'Big Calendar',
    component: BigCalendarModule
  }
}