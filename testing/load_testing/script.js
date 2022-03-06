import http from 'k6/http';
import {sleep} from 'k6';

/*
Very simple load test on the default GDPC1 entry
 */

export let options = {
    noConnectionReuse: true,
    vus: 10,
    duration: '60s'
};

export default function () {
    // very long URL taken from frontend construction
    http.get('https://bn-filtering.herokuapp.com/user-specified-time-series?' +
        'window=40&delta_select=2&fixed_delta=&ib=true&demean=dm&transform=true&p_code=p1&d_code=nd&take_log=true&' +
        'processed_y=1934.5,1932.3,1930.3,1960.7,1989.5,2021.9,2033.2,2035.3,2007.5,2000.8,2022.8,2004.7,2084.6,2147.6,2230.4,2273.4,2304.5,2344.5,2392.8,2398.1,2423.5,2428.5,2446.1,2526.4,2573.4,2593.5,2578.9,2539.8,2528,2530.7,2559.4,2609.3,2683.8,2727.5,2764.1,2780.8,2770,2792.9,2790.6,2836.2,2854.5,2848.2,2875.9,2846.4,2772.7,2790.9,2855.5,2922.3,2976.6,3049,3043.1,3055.1,3123.2,3111.3,3119.1,3081.3,3102.3,3159.9,3212.6,3277.7,3336.8,3372.7,3404.8,3418,3456.1,3501.1,3569.5,3595,3672.7,3716.4,3766.9,3780.2,3873.5,3926.4,4006.2,4100.6,4201.9,4219.1,4249.2,4285.6,4324.9,4328.7,4366.1,4401.2,4490.6,4566.4,4599.3,4619.8,4691.6,4706.7,4736.1,4715.5,4707.1,4715.4,4757.2,4708.3,4834.3,4861.9,4900,4914.3,5002.4,5118.3,5165.4,5251.2,5380.5,5441.5,5411.9,5462.4,5417,5431.3,5378.7,5357.2,5292.4,5333.2,5421.4,5494.4,5618.5,5661,5689.8,5732.5,5799.2,5913,6017.6,6018.2,6039.2,6274,6335.3,6420.3,6433,6440.8,6487.1,6503.9,6524.9,6392.6,6382.9,6501.2,6635.7,6587.3,6662.9,6585.1,6475,6510.2,6486.8,6493.1,6578.2,6728.3,6860,7001.5,7140.6,7266,7337.5,7396,7469.5,7537.9,7655.2,7712.6,7784.1,7819.8,7898.6,7939.5,7995,8084.7,8158,8292.7,8339.3,8449.5,8498.3,8610.9,8697.7,8766.1,8831.5,8850.2,8947.1,8981.7,8983.9,8907.4,8865.6,8934.4,8977.3,9016.4,9123,9223.5,9313.2,9406.5,9424.1,9480.1,9526.3,9653.5,9748.2,9881.4,9939.7,10052.5,10086.9,10122.1,10208.8,10281.2,10348.7,10529.4,10626.8,10739.1,10820.9,10984.2,11124,11210.3,11321.2,11431,11580.6,11770.7,11864.7,11962.5,12113.1,12323.3,12359.1,12592.5,12607.7,12679.3,12643.3,12710.3,12670.1,12705.3,12822.3,12893,12955.8,12964,13031.2,13152.1,13372.4,13528.7,13606.5,13706.2,13830.8,13950.4,14099.1,14172.7,14291.8,14373.4,14546.1,14589.6,14602.6,14716.9,14726,14838.7,14938.5,14991.8,14889.5,14963.4,14891.6,14577,14375,14355.6,14402.5,14541.9,14604.8,14745.9,14845.5,14939,14881.3,14989.6,15021.1,15190.3,15291,15362.4,15380.8,15384.3,15491.9,15521.6,15641.3,15793.9,15747,15900.8,16094.5,16186.7,16269,16374.2,16454.9,16490.7,16525,16570.2&');
    sleep(10);
};