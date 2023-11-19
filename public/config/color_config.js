
Color = {
    parseNodeColor: function (nc) {
        switch (nc) {
            case 'green':
                return '#269322';
            case 'red':
                return '#BE0005';
            case 'gray':
                return '#616161';
            case 'blue':
                return '#1457B1';
            default:
                return '#AAAAAA';
        }
    },
    parseLinkColor: function (nc) {
        switch (nc) {
            case 'green':
                return '#81BD80';
            case 'red':
                return '#D06C6E';
            case 'gray':
                return '#717171';
            case 'blue':
                return '#82A4D2';
            default:
                return '#AAAAAA';
        }

    }
}

