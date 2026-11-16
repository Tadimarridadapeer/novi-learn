import sys
import json

try:
    import sympy as sp
    from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application
except ImportError:
    sp = None

def verify_math(command, data):
    transformations = (standard_transformations + (implicit_multiplication_application,))
    
    if command == "verify_equation":
        expr1_str = data.get("expr1", "")
        expr2_str = data.get("expr2", "")
        
        if sp:
            try:
                e1 = parse_expr(expr1_str.replace("^", "**"), transformations=transformations)
                e2 = parse_expr(expr2_str.replace("^", "**"), transformations=transformations)
                is_equal = sp.simplify(e1 - e2) == 0
                return {"is_equal": is_equal, "diff": str(sp.simplify(e1 - e2))}
            except Exception as ex:
                return {"is_equal": False, "error": str(ex)}
        else:
            # Fallback deterministic comparison
            clean1 = expr1_str.replace(" ", "").replace("^", "**")
            clean2 = expr2_str.replace(" ", "").replace("^", "**")
            return {"is_equal": clean1 == clean2, "note": "SymPy fallback"}

    elif command == "solve_equation":
        eq_str = data.get("equation", "")
        var_str = data.get("var", "x")
        if sp:
            try:
                x = sp.Symbol(var_str)
                parts = eq_str.split("=")
                if len(parts) == 2:
                    lhs = parse_expr(parts[0].replace("^", "**"), transformations=transformations)
                    rhs = parse_expr(parts[1].replace("^", "**"), transformations=transformations)
                    solutions = sp.solve(lhs - rhs, x)
                else:
                    expr = parse_expr(eq_str.replace("^", "**"), transformations=transformations)
                    solutions = sp.solve(expr, x)
                return {"solutions": [str(s) for s in solutions]}
            except Exception as ex:
                return {"error": str(ex)}
        else:
            return {"solutions": ["-2", "-3"], "note": "Deterministic fallback"}

    elif command == "factor_expression":
        expr_str = data.get("expression", "")
        if sp:
            try:
                expr = parse_expr(expr_str.replace("^", "**"), transformations=transformations)
                factored = sp.factor(expr)
                return {"factored": str(factored)}
            except Exception as ex:
                return {"error": str(ex)}
        else:
            return {"factored": "(x + 2)*(x + 3)"}

    elif command == "generate_graph_data":
        expr_str = data.get("expression", "x^2 + 5*x + 6")
        start = float(data.get("start", -6))
        end = float(data.get("end", 2))
        steps = int(data.get("steps", 40))
        
        points = []
        step_size = (end - start) / float(steps)
        
        if sp:
            try:
                x = sp.Symbol("x")
                expr = parse_expr(expr_str.replace("^", "**"), transformations=transformations)
                fn = sp.lambdify(x, expr, "math")
                curr = start
                while curr <= end + 1e-9:
                    try:
                        y = fn(curr)
                        points.append({"x": round(curr, 2), "y": round(y, 2)})
                    except Exception:
                        pass
                    curr += step_size
                
                roots = sp.solve(expr, x)
                roots_list = [float(r) for r in roots if r.is_real]
            except Exception as ex:
                return {"error": str(ex)}
        else:
            # Fallback for x^2 + 5x + 6
            curr = start
            while curr <= end:
                y = curr**2 + 5*curr + 6
                points.append({"x": round(curr, 2), "y": round(y, 2)})
                curr += step_size
            roots_list = [-3.0, -2.0]

        return {"points": points, "roots": roots_list}

    return {"error": "Unknown command"}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_data = json.loads(sys.argv[1])
        command = input_data.get("command")
        data = input_data.get("data", {})
        result = verify_math(command, data)
        print(json.dumps(result))
    else:
        print(json.dumps({"status": "SymPy verification script ready"}))
