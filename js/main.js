// $(document).ready(function() {
//     $("#proglink, #artlink").hover(function() {
//       console.log("registered");

//         $("body").css({
//             transition: 'background-color 1s ease-in-out',
//             "background-color": "green"
//         });

//     });

//     $("#proglink, #artlink").mouseleave(function() {
//         //$("#succ").html("succC");
//         console.log("out of");

//         $("body").css({
//             transition: 'background-color 1s ease-in-out',
//             "background-color": "0033cc"
//         });

//     });
// });

$(document).ready(function () {
    $("#proglink, #photlink, #artlink, #aboutlink").hover(function () {
        var hovLink = $(this).attr("id");
        console.log($(this).attr("id"));

        var color;
        switch (hovLink) {
            case "proglink":
                color = "#0018ff";
                break;
            case "photlink":
                color = "#1bb51e";
                break;
            case "artlink":
                color = "#e51e18";
                break;
            case "aboutlink":
                color = "#000";
                break;
        }


        // $("body").css({
        //     transition: 'background-color 0.5s ease-in-out',
        //     "background-color": color
        // });

        $("a, #intro").css({
            transition: 'color 0.3s ease-in-out',
            "color": color
        });

    });

    $("a").mouseleave(function () {
        //$("#succ").html("succC");

        $("a, #intro").css({
            transition: 'color 0.3s ease-in-out',
            "color": "#061452"
        });

    });
});
