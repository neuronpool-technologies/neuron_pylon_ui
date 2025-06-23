export const chronoIdlFactory = ({ IDL }) => {
    const Account = IDL.Record({
        'owner': IDL.Principal,
        'subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
    });
    const Sent = IDL.Record({
        'to': IDL.Variant({ 'icp': IDL.Vec(IDL.Nat8), 'icrc': Account }),
        'ledger': IDL.Principal,
        'amount': IDL.Nat,
    });
    const Received = IDL.Record({
        'from': IDL.Variant({ 'icp': IDL.Vec(IDL.Nat8), 'icrc': Account }),
        'ledger': IDL.Principal,
        'amount': IDL.Nat,
    });
    const C100_Account = IDL.Variant({ 'sent': Sent, 'received': Received });

    // Add missing Dex-related types
    const Swap = IDL.Record({
        'from': Account,
        'to': Account,
        'amountIn': IDL.Nat,
        'amountOut': IDL.Nat,
        'zeroForOne': IDL.Bool,
        'newPrice': IDL.Float64,
    });

    const LiquidityAdd = IDL.Record({
        'fromA': Account,
        'amountA': IDL.Nat,
        'fromB': Account,
        'to': Account,
        'amountB': IDL.Nat,
    });

    const LiquidityRemove = IDL.Record({
        'from': Account,
        'toA': Account,
        'amountA': IDL.Nat,
        'toB': Account,
        'amountB': IDL.Nat,
    });

    const C200_Dex = IDL.Variant({
        'swap': Swap,
        'liquidityAdd': LiquidityAdd,
        'liquidityRemove': LiquidityRemove,
    });

    const ChronoRecord = IDL.Variant({
        'account': C100_Account,
        'dex': C200_Dex,
    });

    return {
        ChronoRecord,
        C100_Account,
        Account,
        Sent,
        Received,
        // Add the new types to the exports
        Swap,
        LiquidityAdd,
        LiquidityRemove,
        C200_Dex,
    }
};